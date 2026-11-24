/* Onat's economy equations. January 1972 is month 0.
 * Rates use percentage points (8 means 8%). Shares and indices use ratios.
 * History is chronological and ends at t-1. Each monthly result is a history row.
 */
(function (root) {
  'use strict';

  const defaults = Object.freeze({
    initialFx: 20,
    monthlyFxChange: 1,
    referenceUnemployment: 8,
    marginalPropensityToConsume: 0.74,
    initialInvestmentEfficiency: 1,
    initialCreditAdequacy: 0,
    initialAgriculturalProduction: 1,
    initialIndustrialProduction: 1,
    creditDemandCoefficient: 0.10,
    creditCapacityCoefficient: 0.20,
    lendingAdjustment: 0.50,
    targetRealLendingRate: 2.5
  });

  const clip = (value, min, max) => Math.max(min, Math.min(max, value));
  const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;
  const percentChange = (current, previous) => 100 * (current / previous - 1);
  const annualize = (current, previous) => 100 * (Math.pow(current / previous, 12) - 1);

  // Calendar months are zero-based from January 1972: April is month 3 modulo 12.
  // The April rule uses March's expected inflation, not April's updated expectation.
  function calculateCentralBankRate({ month, previous, comparison, previousMoneyGrowth,
    referenceUnemployment = defaults.referenceUnemployment }) {
    if (month % 12 !== 3) return previous.centralBankRate;
    const expectedInflation = previous.expectedInflation ?? previous.inflation;
    const adjustment =
      0.20 * (previous.inflation - (comparison.inflation + expectedInflation) / 2) +
      0.06 * (previous.inflation - previous.centralBankRate) +
      0.10 * (previousMoneyGrowth - (previous.realGdpGrowth12 ?? previous.realGdpGrowth) - previous.inflation) +
      0.08 * (previous.realGdpGrowth - 5.5) -
      0.15 * (previous.unemployment - referenceUnemployment) +
      0.25 * previous.fxStress / (1 + previous.fxStress);
    const positiveInflation = Math.max(0, previous.inflation);
    const minimumChange = -Math.max(0.5, 0.05 * positiveInflation);
    const maximumChange = Math.max(1, 0.20 * positiveInflation);
    return Math.max(0, previous.centralBankRate + clip(adjustment, minimumChange, maximumChange));
  }

  function calculateLendingRate({ previousLendingRate, centralBankRate, lendingSpread,
    adjustment = defaults.lendingAdjustment }) {
    return clip((1 - adjustment) * previousLendingRate +
      adjustment * (centralBankRate + lendingSpread), centralBankRate, 2 * centralBankRate);
  }

  function calculateMoneySupply({ previousMoneySupply, previousMoneyGrowth, previousGdpGrowth,
    expectedInflation, creditDemand, realLendingRate, annualGrowthLimit = Infinity, epsilon = 1e-8,
    referenceRealRate = defaults.targetRealLendingRate }) {
    const growth = 0.70 * previousMoneyGrowth +
      0.30 * (previousGdpGrowth + expectedInflation) + 1.50 * creditDemand -
      0.10 * (realLendingRate - referenceRealRate);
    // Existing monetary-policy restrictions cap the annual growth driver.
    const limitedGrowth = Math.min(growth, annualGrowthLimit);
    if (!Number.isFinite(limitedGrowth)) throw new RangeError('Annual M2 growth must be finite.');
    // Approved domain floor: keep M2 positive if deflation pushes the driver to -100% or below.
    const moneySupplyGrowthRate = Math.max(100*(epsilon-1), limitedGrowth);
    const moneySupply = previousMoneySupply * Math.pow(1 + moneySupplyGrowthRate / 100, 1 / 12);
    return { moneySupply, moneySupplyGrowthRate };
  }


  // Scenario calibration, not additional historical observations. Amounts use the
  // baseline's billion-TL scale and billion USD for external flows. All are policy inputs.
  const externalDefaults = Object.freeze({
    "epsilon": 1e-9,
    "exchangeRate": 14,
    "foreignPrice": 1,
    "exportCapacity": 0.06776900024430885,
    "maxExportCapacity": 0.1355380004886177,
    "exportElasticity": 0.5,
    "exportPrice": 0.09829186361883406,
    "finalImportPrice": 0.09829186361883406,
    "intermediateImportPrice": 0.09829186361883406,
    "exportCollection": 1,
    "remittanceCollection": 1,
    "remittances": 0.03925,
    "initialDebt": 2.21,
    "initialReserves": 0.748,
    "debtRate": 2.1475494633550474,
    "debtMonths": 120,
    "legacyPrincipal": 0.007583333333333333,
    "debtIncomeMultiple": 2.1,
    "minimumReserves": 0.2571839059936105,
    "importCoverTarget": 3,
    "importForecastBound": 0.06,
    "finalImportPriority": 0.5,
    "passThrough": 1,
    "importedCostWeight": 0.08616609131586751,
    "exportActionLag": 12,
    "governmentShare": 0.1412313181246424,
    "lendingSpread": 2.5
});
  const spending = ['C', 'I', 'G', 'EX'];
  const importKinds = ['final', 'intermediate'];
  // Mandatory/flexible shares of each expenditure category; configurable by scenario.
  const importDefaults = Object.freeze({
    "C": {
        "final": [
            0.004059411216141547,
            0.0021858368086916024
        ],
        "intermediate": [
            0.03159643932156663,
            0.00789910983039166
        ],
        "beta": 0.5
    },
    "I": {
        "final": [
            0.14687876930888716,
            0.07908856808940076
        ],
        "intermediate": [
            0.04739465898234996,
            0.01184866474558749
        ],
        "beta": 0.65
    },
    "G": {
        "final": [
            0,
            0
        ],
        "intermediate": [
            0.012638575728626656,
            0.003159643932156663
        ],
        "beta": 0.3
    },
    "EX": {
        "final": [
            0,
            0
        ],
        "intermediate": [
            0.056873590778819955,
            0.014218397694704982
        ],
        "beta": 0.75
    }
});

  function calculateMonth({ month, history, inputs, initialRealCreditToPotential, parameters = {} }) {
    if (!Number.isInteger(month) || month < 0 || history.length < 24)
      throw new RangeError('A campaign month and at least 24 preceding monthly rows are required.');
    const settings = { ...defaults, ...parameters };
    const x = { ...externalDefaults, ...parameters.external, ...inputs.external };
    const eps = x.epsilon;
    if (!(eps > 0 && eps < 1)) throw new RangeError('epsilon must be between zero and one.');
    const pos = (v, name) => { if (!(v > 0 && Number.isFinite(v))) throw new RangeError(name + ' must be positive.'); return v; };
    const nonneg = (v, name) => { if (!(v >= 0 && Number.isFinite(v))) throw new RangeError(name + ' must be nonnegative.'); return v; };
    const share = (v, name) => { if (!(v >= 0 && v <= 1)) throw new RangeError(name + ' must be in [0,1].'); return v; };
    nonneg(x.maxExportCapacity,'maximum export capacity');
    nonneg(x.importForecastBound,'import forecast bound');
    nonneg(x.initialReserves,'initial reserves');
    if(!Number.isInteger(x.exportActionLag)||x.exportActionLag<1||x.exportActionLag>24)
      throw new RangeError('Export action lag must be one to 24 months.');
    const lag = n => history[history.length - n];
    const previous = lag(1), yearAgo = lag(12), twoYearsAgo = lag(24);
    const avg = (fn, first, last) => mean(Array.from({length:last-first+1}, (_,i)=>fn(lag(first+i))));
    const level = (value, growth) => value * Math.pow(Math.max(eps, 1 + growth / 100), 1 / 12);
    const epsY = eps * (parameters.initialRealGdp ?? history[0].realGdp);
    const cpiBase = parameters.initialCpi ?? 1;
    const initialRatio = initialRealCreditToPotential ?? previous.nominalCredit * cpiBase / (previous.cpi * previous.potentialGdp);
    const { referenceUnemployment, marginalPropensityToConsume } = settings;
    const { cooperativization=1, cooperativeBank=1, peoplesSectorIntegration=0,
      koykentInvestment=0, cooperativeUnions=0, highTechPolicy=0, stateEnterpriseRestructuring=0,
      fiscalContribution=0, publicEmployment=0, outputShock=0, costShock=0 } = inputs;
    const savingsRate = 100 * share((inputs.savingsRate ?? previous.savingsRate) / 100, 'investment share');
    const averageSavings = avg(r=>r.realizedInvestmentShare ?? r.savingsRate, 12, 23);
    const averageUnemployment = avg(r=>r.unemployment, 13, 24);
    const investmentEfficiency = month === 0 ? settings.initialInvestmentEfficiency :
      1 + 0.02*(cooperativization-1) + 0.02*(cooperativeBank-1) + 0.04*peoplesSectorIntegration;
    const effectiveInvestment = 0.52 * averageSavings;
    const laborFactor = clip(1-0.08*Math.max(0,averageUnemployment-referenceUnemployment)/100,0.90,1);
    const investmentFxFactor = 1; // Superseded by actual import constraints, equation 31.
    const capacityGrowth = 0.60+0.28*effectiveInvestment*lag(12).investmentEfficiency*laborFactor;
    const potentialGdp = level(previous.potentialGdp,capacityGrowth);
    const creditDemand = 0.10*(previous.creditAdequacy-lag(13).creditAdequacy);
    const creditCeiling = potentialGdp*Math.exp(-0.20*Math.max(0,-previous.creditAdequacy)/100);
    const previousMoneyGrowth = percentChange(previous.moneySupply,lag(13).moneySupply);
    const previousGrowth12 = previous.realGdpGrowth12 ?? percentChange(previous.realGdp,lag(13).realGdp);
    const centralBankRate = inputs.centralBankRate ?? calculateCentralBankRate({month,
      previous:{...previous,realGdpGrowth12:previousGrowth12},comparison:lag(13),previousMoneyGrowth,referenceUnemployment});
    const expectedInflation = previous.nextExpectedInflation;
    if (!(expectedInflation > -100)) throw new RangeError('Expected inflation must exceed -100%.');
    const lendingSpread = inputs.lendingSpread ?? x.lendingSpread;
    const lendingRate = calculateLendingRate({previousLendingRate:previous.lendingRate,centralBankRate,lendingSpread,adjustment:settings.lendingAdjustment});
    const realLendingRate = 100*((1+lendingRate/100)/(1+expectedInflation/100)-1);
    const circulationPressure = Math.min(18,Math.max(0,-realLendingRate));
    const monetary = inputs.moneySupply == null ? calculateMoneySupply({previousMoneySupply:previous.moneySupply,
      previousMoneyGrowth,previousGdpGrowth:previousGrowth12,expectedInflation,creditDemand,realLendingRate,
      annualGrowthLimit:inputs.moneyGrowthLimit,epsilon:eps}) : {moneySupply:pos(inputs.moneySupply,'M2'),moneySupplyGrowthRate:annualize(inputs.moneySupply,previous.moneySupply)};
    const {moneySupply,moneySupplyGrowthRate}=monetary;
    const nominalCredit = level(previous.nominalCredit,previousMoneyGrowth-0.5*((previous.realLendingRate ??
      100*((1+previous.lendingRate/100)/(1+(previous.expectedInflation ?? previous.inflation)/100)-1))-2.5));
    const previousAbsorption = previous.absorption ?? previous.realGdp;
    const consumptionShare = previous.consumption/Math.max(epsY,previousAbsorption);
    const h=Math.max(consumptionShare,0.05), priorStress=clip(previous.fxStress,0,1);
    const targetConsumptionGrowth = 5.5+0.45*marginalPropensityToConsume/h*(previous.realGdpGrowth-5.5)
      -0.08*Math.max(0,previous.inflation-12)-0.10*(realLendingRate-3)
      -0.25*(savingsRate-yearAgo.savingsRate)-1.50*Math.pow(priorStress/(1+priorStress),2);
    const baselineConsumptionGrowth=0.35*previous.consumptionGrowth+0.65*targetConsumptionGrowth;
    const deflationEffect=previous.inflation<0?0.50*previous.inflation:0;
    const consumptionGrowth=baselineConsumptionGrowth+(marginalPropensityToConsume*(fiscalContribution+creditDemand)
      +deflationEffect+0.35*(capacityGrowth-5.5))/h;
    const desiredConsumption=level(previous.consumption,consumptionGrowth);
    const desiredInvestment=savingsRate/100*previous.realGdp;
    const desiredGovernment=level(previous.desiredGovernment ?? previous.government ?? x.governmentShare*previous.realGdp,inputs.governmentGrowth ?? 0);
    const desiredAbsorption=desiredConsumption+desiredInvestment+desiredGovernment;
    const demandGrowth=annualize(desiredAbsorption,previousAbsorption),baselineDemandGrowth=demandGrowth;

    const exchangeRate=pos((previous.exchangeRate ?? x.exchangeRate)*(1+(inputs.exchangeRateChange ?? 0)),'exchange rate');
    const foreignPrice=pos(inputs.foreignPrice ?? previous.foreignPrice ?? x.foreignPrice,'foreign price');
    const exchangeBase=parameters.initialExchangeRate ?? x.exchangeRate;
    // P_t is not yet solved; only the lagged real exchange rate enters this month's trade.
    const priorRealExchange=previous.realExchangeRate ?? 100;
    const exportCapacity=clip((previous.exportCapacity ?? x.exportCapacity)+(lag(Math.min(24,x.exportActionLag)).exportCapacityAction ?? 0)
      -(inputs.exportCapacityWear ?? 0),0,x.maxExportCapacity);
    const desiredExports=exportCapacity*potentialGdp*share(inputs.worldDemand ?? 1,'world demand')*
      Math.min(1,Math.pow(priorRealExchange/100,nonneg(x.exportElasticity,'export elasticity')));
    const exportPrice=pos(inputs.exportPrice ?? x.exportPrice,'export price');
    const prices={final:pos(inputs.finalImportPrice ?? x.finalImportPrice,'final import price'),intermediate:pos(inputs.intermediateImportPrice ?? x.intermediateImportPrice,'intermediate import price')};
    const plans={C:desiredConsumption,I:desiredInvestment,G:desiredGovernment,EX:desiredExports};
    const imports={}, valueAdded={}, adjustedValueAdded={}, coefficients={};
    const plannedRealByKind={final:0,intermediate:0},plannedDollarsByKind={final:0,intermediate:0};
    const elasticity=inputs.importElasticities ?? {final:0.5,intermediate:0.3};
    for(const j of spending){
      const cfg=inputs.importCoefficients?.[j] ?? importDefaults[j];
      const forced=importKinds.map(k=>nonneg(cfg[k][0],'mandatory import share'));
      const flexible=importKinds.map(k=>nonneg(cfg[k][1],'flexible import share')*Math.pow(priorRealExchange/100,-nonneg(elasticity[k],'import elasticity')));
      const forcedSum=forced[0]+forced[1];
      if(forcedSum>1-eps)throw new RangeError('Mandatory import shares exceed domestic-value bound.');
      const scale=Math.min(1,(1-eps-forcedSum)/Math.max(eps,flexible[0]+flexible[1]));
      imports[j]={};coefficients[j]={};
      importKinds.forEach((k,i)=>{const alpha=forced[i]+flexible[i]*scale;coefficients[j][k]=alpha;
        imports[j][k]=alpha*plans[j];plannedRealByKind[k]+=imports[j][k];plannedDollarsByKind[k]+=prices[k]*imports[j][k]/12;});
      valueAdded[j]=Math.max(0,plans[j]-imports[j].final-imports[j].intermediate);
    }
    const plannedImports=plannedRealByKind.final+plannedRealByKind.intermediate;
    const plannedImportDollars=plannedDollarsByKind.final+plannedDollarsByKind.intermediate;
    const epsDollar=eps*(parameters.initialImportDollars ?? Math.max(plannedImportDollars,eps));
    const exportCash=share(inputs.exportCollection ?? x.exportCollection,'export collection')*(previous.exportDollars ?? exportPrice*desiredExports/12);
    const availableRemittances=share(inputs.remittanceCollection ?? x.remittanceCollection,'remittance collection')*nonneg(inputs.remittances ?? x.remittances,'remittances');
    const debtMonths=inputs.debtMonths ?? x.debtMonths;
    if(!Number.isInteger(debtMonths)||debtMonths<=0)throw new RangeError('Debt maturity must be a positive integer.');
    const initialDebt=nonneg(parameters.initialDebt ?? x.initialDebt,'initial debt');
    // Initial debt is separate from the new-loan schedule. No inherited loan is registered twice.
    const legacyPrincipal=nonneg(inputs.legacyPrincipal ?? Math.min(x.legacyPrincipal,Math.max(0,initialDebt-month*x.legacyPrincipal)),'legacy principal');
    const priorSchedule=previous.loanSchedule ?? [];
    const scheduledNewPrincipal=priorSchedule.reduce((sum,l)=>sum+(l.remainingMonths>0?l.installment:0),0);
    const previousDebt=previous.externalDebt ?? initialDebt;
    const principalDue=Math.min(previousDebt,legacyPrincipal+scheduledNewPrincipal+(previous.principalArrears ?? 0));
    if(!(x.debtRate>-100))throw new RangeError('External interest must exceed -100%.');
    const interestDue=previousDebt*(Math.pow(1+x.debtRate/100,1/12)-1)+(previous.interestArrears ?? 0);
    const debtService=principalDue+interestDue;
    const debtLimit=nonneg(x.debtIncomeMultiple,'debt income multiple')*avg(r=>(r.exportCash ?? exportCash)+(r.availableRemittances ?? availableRemittances),1,12)*12;
    const requestedLoan=nonneg(inputs.requestedLoan ?? 0,'requested loan');
    const newLoan=Math.min(requestedLoan,Math.max(0,debtLimit-previousDebt+principalDue));
    const liquidityShock=inputs.reserveAdjustment ?? 0;
    const reservesBeforeService=Math.max(0,(previous.reserves ?? x.initialReserves)+exportCash+availableRemittances+newLoan+liquidityShock);
    const debtServiceGap=Math.max(0,debtService-reservesBeforeService);
    // Crisis branch: pay interest first, retain unpaid principal in debt and carry
    // arrears explicitly. No imports are financed until scheduled service is covered.
    const paidInterest=interestDue<=0?interestDue:Math.min(interestDue,reservesBeforeService);
    const paidPrincipal=Math.min(principalDue,Math.max(0,reservesBeforeService-paidInterest));
    const principalArrears=principalDue-paidPrincipal,interestArrears=Math.max(0,interestDue-paidInterest);
    const externalDebt=Math.max(0,previousDebt+newLoan-paidPrincipal);
    const loanSchedule=priorSchedule.filter(l=>l.remainingMonths>1).map(l=>({...l,remainingMonths:l.remainingMonths-1}));
    if(newLoan>0)loanSchedule.push({installment:newLoan/debtMonths,remainingMonths:debtMonths});
    const importBudget=debtServiceGap>0?0:Math.max(0,reservesBeforeService-debtService-nonneg(inputs.minimumReserves ?? x.minimumReserves,'minimum reserves'));
    const intermediateBudget=Math.min(plannedDollarsByKind.intermediate,Math.max(0,importBudget-share(inputs.finalImportPriority ?? x.finalImportPriority,'final import priority')*plannedDollarsByKind.final));
    const finalBudget=Math.min(plannedDollarsByKind.final,Math.max(0,importBudget-intermediateBudget));
    const rho={final:plannedDollarsByKind.final>0?finalBudget/plannedDollarsByKind.final:1,
      intermediate:plannedDollarsByKind.intermediate>0?intermediateBudget/plannedDollarsByKind.intermediate:1};
    for(const j of spending){const beta=share((inputs.importCoefficients?.[j] ?? importDefaults[j]).beta,'input shortage sensitivity');
      if(beta>1-eps)throw new RangeError('Input shortage sensitivity must be below one.');
      adjustedValueAdded[j]=valueAdded[j]*(1-beta*(1-rho.intermediate)*Math.min(1,imports[j].intermediate/Math.max(epsY,valueAdded[j])));}
    const domesticValue=Object.values(adjustedValueAdded).reduce((a,b)=>a+b,0);
    const outputCeiling=creditCeiling*Math.exp(outputShock/100);
    const realization=Math.min(1,outputCeiling/Math.max(epsY,domesticValue));
    const actual={};for(const j of spending)actual[j]=rho.final*imports[j].final+realization*(adjustedValueAdded[j]+rho.intermediate*imports[j].intermediate);
    const realImports=rho.final*plannedRealByKind.final+realization*rho.intermediate*plannedRealByKind.intermediate;
    const importDollars=rho.final*plannedDollarsByKind.final+realization*rho.intermediate*plannedDollarsByKind.intermediate;
    const realGdp=pos(realization*domesticValue,'real GDP');
    const consumption=actual.C,investment=actual.I,government=actual.G,exports=actual.EX;
    const netExports=exports-realImports,absorption=consumption+investment+government;
    const desiredOutput=desiredAbsorption+desiredExports-plannedImports;
    const realGdpGrowth=annualize(realGdp,previous.realGdp),realGdpGrowth12=percentChange(realGdp,yearAgo.realGdp);
    const realizedInvestmentShare=100*investment/realGdp;
    const counterfactualGdp=Math.min(desiredOutput,potentialGdp)*Math.exp(outputShock/100);
    const counterfactualGrowth=annualize(counterfactualGdp,previous.counterfactualGdp);
    const counterfactualGrowth12=percentChange(counterfactualGdp,yearAgo.counterfactualGdp);
    const stableEmploymentGrowth=5.5+0.40*(capacityGrowth-5.5);
    const unemploymentAtGrowth=g=>clip(previous.unemployment+0.25/12*(stableEmploymentGrowth-g)-publicEmployment,0,100);
    const unemployment=unemploymentAtGrowth(realGdpGrowth),counterfactualUnemployment=unemploymentAtGrowth(counterfactualGrowth);
    const unmetDemand=100*Math.max(0,(desiredOutput-realGdp)/realGdp);
    const smoothedUnmetDemand=0.65*previous.smoothedUnmetDemand+0.35*unmetDemand;
    const reserves=Math.max(0,reservesBeforeService-paidPrincipal-paidInterest-importDollars);
    const importForecastGrowth=clip(Math.log(Math.max(epsDollar,plannedImportDollars)/Math.max(epsDollar,yearAgo.plannedImportDollars ?? plannedImportDollars))/12,-x.importForecastBound,x.importForecastBound);
    const forecastMean=mean(Array.from({length:12},(_,i)=>plannedImportDollars*Math.exp(i*importForecastGrowth)));
    // null is the JSON-safe representation of infinite cover when no imports are needed.
    const importCover=plannedImportDollars>0?reserves/forecastMean:null;
    const coverShortage=importCover===null?0:clip(1-importCover/pos(x.importCoverTarget,'cover target'),0,1);
    const importShortage=plannedImportDollars>0?1-(intermediateBudget+finalBudget)/plannedImportDollars:0;
    const fx=100*Math.max(coverShortage,importShortage);
    const effectiveFx=Math.max(fx,0.75*avg(r=>r.fx,1,6));
    const fxSeverity=clip(effectiveFx/100,0,1);
    const fxStress=fxSeverity>=priorStress?fxSeverity:priorStress+0.10*(fxSeverity-priorStress);
    const averageSectorFx=(fx+11*avg(r=>r.fx,1,11))/12;
    const sectorFxPenalty=Math.pow(Math.max(0,(averageSectorFx-65)/35),2);
    const agriculturalProduction = month === 0 ? settings.initialAgriculturalProduction :
      previous.agriculturalProduction * Math.exp((
        0.025 * (yearAgo.cooperativization - twoYearsAgo.cooperativization) *
          (1 + 0.10 * (yearAgo.cooperativeBank - 1)) +
        0.015 * (yearAgo.cooperativeBank - twoYearsAgo.cooperativeBank) +
        0.035 * (yearAgo.koykentInvestment - twoYearsAgo.koykentInvestment) +
        0.015 * (yearAgo.cooperativeUnions - twoYearsAgo.cooperativeUnions) -
        0.015 * sectorFxPenalty
      ) / 12);
    const industrialProduction = month === 0 ? settings.initialIndustrialProduction :
      previous.industrialProduction * Math.exp((
        0.060 * (1 + 0.04 * yearAgo.peoplesSectorIntegration) *
          (yearAgo.highTechPolicy - twoYearsAgo.highTechPolicy) +
        0.025 * (yearAgo.stateEnterpriseRestructuring - twoYearsAgo.stateEnterpriseRestructuring) -
        0.050 * sectorFxPenalty
      ) / 12);


    const moneyGrowth=percentChange(moneySupply,yearAgo.moneySupply);
    const unboundedInflationTrend=expectedInflation+0.60/12*(moneyGrowth-counterfactualGrowth12-expectedInflation)
      +1.20/12*(referenceUnemployment-counterfactualUnemployment)+1.80/12*smoothedUnmetDemand+0.10/12*circulationPressure;
    const inflationTrend=clip(unboundedInflationTrend,-60,300);
    const priorPrices=previous.importPrices ?? {final:x.finalImportPrice,intermediate:x.intermediateImportPrice};
    const priorVolumes=previous.plannedRealByKind ?? plannedRealByKind;
    const oldCost=importKinds.reduce((v,k)=>v+priorPrices[k]*priorVolumes[k],0);
    const newCost=importKinds.reduce((v,k)=>v+prices[k]*priorVolumes[k],0);
    const importPriceIndex=(previous.importPriceIndex ?? 100)*(oldCost>0?newCost/oldCost:1);
    const fxPriceShock=nonneg(x.passThrough,'pass through')*share(x.importedCostWeight,'imported cost weight')*
      Math.max(0,Math.log(exchangeRate*importPriceIndex/((previous.exchangeRate ?? x.exchangeRate)*(previous.importPriceIndex ?? 100))));
    const cpi=previous.cpi*Math.pow(1+inflationTrend/100,1/12)*Math.exp(fxPriceShock+costShock/100);
    const inflation=percentChange(cpi,yearAgo.cpi),nextExpectedInflation=0.55*expectedInflation+0.45*inflation;
    const realExchangeRate=100*exchangeRate/exchangeBase*foreignPrice/(parameters.initialForeignPrice ?? x.foreignPrice)*cpiBase/cpi;
    const realCredit=nominalCredit*cpiBase/cpi;
    const creditAdequacy=100*Math.log((realCredit/potentialGdp)/initialRatio);
    const initialCreditRatio=initialRatio;
    const agriculturalPriceFactor=Math.pow((moneySupply/(cpi*realGdp))/(previous.moneySupply/(previous.cpi*previous.realGdp)),0.35)
      *Math.pow((consumption/realGdp)/(previous.consumption/previous.realGdp),0.25)*Math.pow(previous.agriculturalProduction/agriculturalProduction,0.65);
    const realAgriculturalPrice=previous.realAgriculturalPrice*agriculturalPriceFactor;
    const nominalAgriculturalPrice=previous.nominalAgriculturalPrice*cpi/previous.cpi*agriculturalPriceFactor;
    const result={month,fiscalContribution,savingsRate,cooperativization,cooperativeBank,peoplesSectorIntegration,koykentInvestment,cooperativeUnions,highTechPolicy,stateEnterpriseRestructuring,
      averageSavings,averageUnemployment,investmentEfficiency,effectiveInvestment,laborFactor,investmentFxFactor,capacityGrowth,potentialGdp,
      fx,effectiveFx,fxSeverity,fxStress,averageSectorFx,agriculturalProduction,industrialProduction,creditDemand,creditCeiling,outputCeiling,
      centralBankRate,lendingSpread,lendingRate,expectedInflation,realLendingRate,consumptionShare,targetConsumptionGrowth,baselineConsumptionGrowth,
      consumptionGrowth,deflationEffect,baselineDemandGrowth,demandGrowth,desiredOutput,realGdp,realGdpGrowth,realGdpGrowth12,desiredConsumption,consumption,
      desiredInvestment,desiredGovernment,desiredAbsorption,investment,government,exports,realImports,netExports,absorption,realizedInvestmentShare,
      domesticSavings:realGdp-consumption-government,stableEmploymentGrowth,unemployment,counterfactualGdp,counterfactualGrowth,counterfactualGrowth12,counterfactualUnemployment,
      unmetDemand,smoothedUnmetDemand,moneySupply,moneySupplyGrowthRate,moneyGrowth,circulationPressure,unboundedInflationTrend,inflationTrend,fxPriceShock,cpi,inflation,nextExpectedInflation,
      nominalCredit,realCredit,initialRealCreditToPotential:initialCreditRatio,creditAdequacy,realAgriculturalPrice,nominalAgriculturalPrice,
      exchangeRate,foreignPrice,realExchangeRate,exportCapacity,exportCapacityAction:inputs.exportCapacityAction ?? 0,desiredExports,exportPrice,exportDollars:exportPrice*exports/12,
      exportCash,availableRemittances,externalDebt,newLoan,debtLimit,principalDue,interestDue,debtService,debtServiceGap,paidPrincipal,paidInterest,principalArrears,interestArrears,
      reservesBeforeService,reserves,importBudget,intermediateBudget,finalBudget,plannedImports,plannedImportDollars,importDollars,importForecastGrowth,importCover,
      coverShortage,importShortage,realization,importPriceIndex,importPrices:prices,plannedRealByKind,plannedDollarsByKind,imports,coefficients,loanSchedule,
      finalImportFunding:rho.final,intermediateImportFunding:rho.intermediate};
    for(const [key,value] of Object.entries(result))if(typeof value==='number'&&!Number.isFinite(value))throw new RangeError('Invalid '+key+' at month '+month);
    return result;
  }

  function calculateCalendarYear(currentYear, previousYear) {
    if (currentYear.length !== 12 || previousYear.length !== 12) {
      throw new RangeError('Calendar-year comparisons require twelve monthly rows for each year.');
    }
    const averageRealGdp = mean(currentYear.map(row => row.realGdp));
    const averageCpi = mean(currentYear.map(row => row.cpi));
    return {
      averageRealGdp,
      averageCpi,
      moneyGrowth: currentYear.at(-1).moneyGrowth,
      nominalCredit: currentYear.at(-1).nominalCredit,
      realLendingRate: mean(currentYear.map(row => row.realLendingRate ?? 0)),
      realGdpGrowth: percentChange(averageRealGdp, mean(previousYear.map(row => row.realGdp))),
      inflation: percentChange(averageCpi, mean(previousYear.map(row => row.cpi))),
      unemployment: mean(currentYear.map(row => row.unemployment))
    };
  }

  const economy = Object.freeze({ defaults, externalDefaults, importDefaults, calculateCentralBankRate, calculateLendingRate,
    calculateMoneySupply, calculateMonth, calculateCalendarYear });
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = economy;
  } else {
    root.AnatolianEconomy = economy;
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
