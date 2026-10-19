// Node export boundary; browser uses the same helper through AnatolianRules.
declare const module: {exports: unknown};

declare const AnatolianProvinces: {ensure(Q: object): void; addPollingPoints(Q: object, points:number):void; active(Q: object): boolean; projectVotes(Q: object, polling: boolean): {classShares: Record<string,number>; support:Record<string,number>;fractions:Record<string,number>;transfer:number;};};

declare const AnatolianKurdishOrganizations: {organizationHtml(Q: object): string; paramilitaryHtml(Q: object): string;};
declare function require(path:string): any;
