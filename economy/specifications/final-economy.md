**1.**

\[
\boxed{
i_t^{CB}=
\begin{cases}
\displaystyle
\max\Bigg\{
0,\;i_{t-1}^{CB}+
\operatorname{clip}\Bigg(
\begin{aligned}
&0.20\left[\pi_{t-1}^{12}-\frac{\pi_{t-13}^{12}+\pi_{t-1}^{e}}{2}\right]\\
&+0.06(\pi_{t-1}^{12}-i_{t-1}^{CB})\\
&+0.10(\mu_{t-1}-g_{t-1}^{12}-\pi_{t-1}^{12})\\
&+0.08(g_{t-1}-5.5)\\
&-0.15(u_{t-1}-u^n)\\
&+0.25\frac{q_{t-1}}{1+q_{t-1}}
\end{aligned},
-\max(0.5,\;0.05\max(0,\pi_{t-1}^{12})),
\max(1,\;0.20\max(0,\pi_{t-1}^{12}))
\Bigg)
\Bigg\},&t=\text{Nisan}\\[10pt]
i_{t-1}^{CB},&t\neq\text{Nisan}
\end{cases}
}
\]

**2.**

\[
\boxed{
i_t=
\max\left[
i_t^{CB},
\min\left(
2i_t^{CB},
(1-i_a)i_{t-1}
+i_a(i_t^{CB}+s_t^{faiz})
\right)
\right]
}
\]

**3.**

\[
\boxed{
r_t=
100\left[
\frac{1+i_t/100}{1+\pi_t^e/100}-1
\right]
}
\]

**4.**

\[
\boxed{
V_t=\min\left(18,\max(0,-r_t)\right)
}
\]

**5.**

\[
\boxed{
M2_t=M2_{t-1}
\left[
\max\left(
\epsilon_0,\,
1+\frac{
0.70\mu_{t-1}
+0.30(g_{t-1}^{12}+\pi_t^e)
+1.50d_t^B
-0.10(r_t-2.5)
}{100}
\right)
\right]^{1/12}
}
\]

**6.**

\[
\boxed{
\mu_{t-1}
=
100\left(\frac{M2_{t-1}}{M2_{t-13}}-1\right)
}
\]

**7.**

\[
\boxed{
\mu_t
=
100\left(\frac{M2_t}{M2_{t-12}}-1\right)
}
\]

**8.**

\[
\boxed{
\mu_y
=
100\left(\frac{M2_{t_y}}{M2_{t_y-12}}-1\right)
}
\]

**9.**

\[
\boxed{
r_y=\frac1{12}\sum_{k=0}^{11}r_{t_y-k}
}
\]

**10.**

\[
\boxed{
B_t^N=
B_{t-1}^N
\left[
\max\left(
\epsilon_0,\,
1+\frac{
\mu_{t-1}-0.5(r_{t-1}-2.5)
}{100}
\right)
\right]^{1/12}
}
\]

**11.**

\[
\boxed{
B_y^N=B_{t_y}^N
}
\]

**12.**

\[
\boxed{
B_t^R=
B_t^N\frac{\mathcal P_0}{\mathcal P_t}
}
\]

**13.**

\[
\boxed{
z_t=
100\ln\left(
\frac{B_t^R/Y_t^{pot}}
{B_0^R/Y_0^{pot}}
\right)
}
\]

**14.**

\[
\boxed{
d_t^B=0.10(z_{t-1}-z_{t-13})
}
\]

**15.**

\[
\boxed{
Y_t^{cred}
=
Y_t^{pot}
\exp\left(
-0.20\frac{\max(0,-z_{t-1})}{100}
\right)
}
\]

**16.**

\[
\boxed{
\bar u_{t-24:t-13}
=
\frac1{12}\sum_{k=13}^{24}u_{t-k}
}
\]

**17.**

\[
\boxed{
L_t=
\operatorname{clip}\left(
1-0.08
\frac{\max(0,\bar u_{t-24:t-13}-u^n)}{100},
0.90,1
\right)
}
\]

**18.**

\[
\boxed{
E_t=
1+0.02(K_t-1)+0.02(Q_t-1)+0.04P_t^{yat}
}
\]

**19.**

\[
\boxed{
I_t^D=\frac{a_t}{100}Y_{t-1}
}
\]

**20.**

\[
\boxed{
G_t^D=
G_{t-1}^D
\left[
\max\left(
\epsilon_0,\,
1+\frac{g_t^G}{100}
\right)
\right]^{1/12}
}
\]

**21.**

\[
\boxed{
h_t=
\frac{C_{t-1}}{\max(\epsilon_Y,A_{t-1})}
}
\]

**22.**

\[
\boxed{
\begin{aligned}
c_t^*={}&5.5\\
&+0.45\frac{m_t}{\max(h_t,0.05)}(g_{t-1}-5.5)\\
&-0.08\max(0,\pi_{t-1}^{12}-12)\\
&-0.10(r_t-3)\\
&-0.25(a_t-a_{t-12})\\
&-1.50\left(\frac{q_{t-1}}{1+q_{t-1}}\right)^2
\end{aligned}
}
\]

**23.**

\[
\boxed{
c_t^0=0.35c_{t-1}+0.65c_t^*
}
\]

**24.**

\[
\boxed{
D_t=-0.50\max(0,-\pi_{t-1}^{12})
}
\]

**25.**

\[
\boxed{
c_t=
c_t^0+
\frac{
m_t(f_t+d_t^B)+D_t+0.35(g_t^K-5.5)
}{
\max(h_t,0.05)
}
}
\]

**26.**

\[
\boxed{
C_t^D=
C_{t-1}
\left[
\max\left(
\epsilon_0,\,
1+\frac{c_t}{100}
\right)
\right]^{1/12}
}
\]

**27.**

\[
\boxed{
A_t^D=C_t^D+I_t^D+G_t^D
}
\]

**28.**

\[
\boxed{
g_t^D=
100\left[
\left(\frac{A_t^D}{A_{t-1}}\right)^{12}-1
\right]
}
\]

**29.**

\[
\boxed{
a_t^{I,ger}=100\frac{I_t}{Y_t}
}
\]

**30.**

\[
\boxed{
I_t^{etkin}
=
0.52\left(
\frac1{12}\sum_{k=12}^{23}a_{t-k}^{I,ger}
\right)
}
\]

**31.**

\[
\boxed{
g_t^K=
0.60+0.28I_t^{etkin}E_{t-12}L_t
}
\]

**32.**

\[
\boxed{
Y_t^{pot}
=
Y_{t-1}^{pot}
\left(1+\frac{g_t^K}{100}\right)^{1/12}
}
\]

**33.**

\[
\boxed{
e_t=e_{t-1}(1+\delta_t^e)
}
\]

**34.**

\[
\boxed{
\mathcal R_t=
100
\left(\frac{e_t}{e_0}\right)
\left(\frac{\mathcal P_t^*}{\mathcal P_0^*}\right)
\left(\frac{\mathcal P_0}{\mathcal P_t}\right)
}
\]

**35.**

\[
\boxed{
\xi_t^{EX}
=
\operatorname{clip}\left(
\xi_{t-1}^{EX}
+\Delta\xi_{t-\ell_I}^{eylem}
-\delta_t^\xi,
0,\overline\xi^{EX}
\right)
}
\]

**36.**

\[
\boxed{
EX_t^{cap,R}=\xi_t^{EX}Y_t^{pot}
}
\]

**37.**

\[
\boxed{
EX_t^{D,R}
=
EX_t^{cap,R}
d_t^{world}
\min\left[
1,
\left(\frac{\mathcal R_{t-1}}{100}\right)^{\varepsilon_{EX}}
\right]
}
\]

**38.**

\[
\boxed{
EX_t^\$=
\frac{p_{EX,t}^{*,\$}EX_t}{12}
}
\]

**39.**

\[
\boxed{
EX_t^{cash,\$}
=
\eta_t^{EX}EX_{t-1}^\$
}
\]

**40.**

\[
\boxed{
TR_t^{available,\$}
=
\eta_t^{TR}TR_t^\$
}
\]

**41.**

\[
\boxed{
PR_t=
PR_t^{eski}
+
\frac1n\sum_{k=1}^{n}L_{t-k}^{new,\$}
}
\]

**42.**

\[
\boxed{
INT_t=
DEBT_{t-1}^\$
\left[
\left(1+\frac{i^{ext}}{100}\right)^{1/12}-1
\right]
}
\]

**43.**

\[
\boxed{
DS_t=PR_t+INT_t
}
\]

**44.**

\[
\boxed{
DEBT_t^{limit,\$}
=
\kappa_D
\sum_{k=1}^{12}
\left(
EX_{t-k}^{cash,\$}
+TR_{t-k}^{available,\$}
\right)
}
\]

**45.**

\[
\boxed{
L_t^{new,\$}
=
\min\left[
L_t^{talep,\$},
\max\left(
0,\,
DEBT_t^{limit,\$}
-DEBT_{t-1}^\$
+PR_t
\right)
\right]
}
\]

**46.**

\[
\boxed{
DEBT_t^\$
=
DEBT_{t-1}^\$
+L_t^{new,\$}-PR_t
}
\qquad(\Gamma_t^{DS}=0)
\]

**47.**

\[
\boxed{
\begin{aligned}
RES_t^{pre}={}&RES_{t-1}^\$\\
&+EX_t^{cash,\$}\\
&+TR_t^{available,\$}\\
&+L_t^{new,\$}
\end{aligned}
}
\]

**48.**

\[
\boxed{
\Gamma_t^{DS}
=
\max(0,DS_t-RES_t^{pre})
}
\]

**49.**

\[
\boxed{
\Gamma_t^{DS}>0
\quad\Longrightarrow\quad
\text{Dış finansman krizi olayı}
}
\]

**50.**

\[
\boxed{
B_t^{IM,\$}
=
\max\left(
0,\,
RES_t^{pre}-DS_t-RES_t^{min}
\right)
}
\qquad(\Gamma_t^{DS}=0)
\]

**51.**

\[
\boxed{
\alpha_{j,k,t}^{ham}
=
\alpha_{j,k,t}^{zor}
+
\alpha_{j,k,t}^{esnek}
\left(
\frac{\mathcal R_{t-1}}{100}
\right)^{-\varepsilon_k}
}
\]

**52.**

\[
\boxed{
\begin{aligned}
\alpha_{j,k,t}^{etkin}
={}&\alpha_{j,k,t}^{zor}\\
&+
(\alpha_{j,k,t}^{ham}-\alpha_{j,k,t}^{zor})\\
&\times
\min\left[
1,\,
\frac{
1-\epsilon_0-\sum_k\alpha_{j,k,t}^{zor}
}{
\max\left(
\epsilon_0,\,
\sum_k(\alpha_{j,k,t}^{ham}-\alpha_{j,k,t}^{zor})
\right)
}
\right]
\end{aligned}
}
\]

**53.**

\[
\boxed{
IM_{j,k,t}^{D,R}
=
\alpha_{j,k,t}^{etkin}F_{j,t}^D
}
\]

**54.**

\[
\boxed{
IM_t^{D,R}
=
\sum_j\sum_k IM_{j,k,t}^{D,R}
}
\]

**55.**

\[
\boxed{
IM_{j,k,t}^{D,\$}
=
\frac{
p_{k,t}^{*,\$}IM_{j,k,t}^{D,R}
}{12}
}
\]

**56.**

\[
\boxed{
IM_{k,t}^{D,\$}
=
\sum_j IM_{j,k,t}^{D,\$}
}
\]

**57.**

\[
\boxed{
IM_t^{D,\$}
=
IM_{\mathrm{nihai},t}^{D,\$}
+
IM_{\mathrm{ara},t}^{D,\$}
}
\]

**58.**

\[
\boxed{
\gamma_t^{IM}
=
\operatorname{clip}\left[
\frac1{12}
\ln\left(
\frac{
\max(\epsilon_\$,IM_t^{D,\$})
}{
\max(\epsilon_\$,IM_{t-12}^{D,\$})
}
\right),
-\overline\gamma^{IM},
\overline\gamma^{IM}
\right]
}
\]

**59.**

\[
\boxed{
\widehat{IM}_{t+\ell\mid t}^{D,\$}
=
IM_t^{D,\$}e^{\ell\gamma_t^{IM}},
\qquad \ell=0,\ldots,11
}
\]

**60.**

\[
\boxed{
B_t^{ara}
=
\min\left(
IM_{\mathrm{ara},t}^{D,\$},
\max\left(
0,\,
B_t^{IM,\$}
-\omega_t^N IM_{\mathrm{nihai},t}^{D,\$}
\right)
\right)
}
\]

**61.**

\[
\boxed{
B_t^{nihai}
=
\min\left(
IM_{\mathrm{nihai},t}^{D,\$},
\max(0,B_t^{IM,\$}-B_t^{ara})
\right)
}
\]

**62.**

\[
\boxed{
\rho_{k,t}
=
\begin{cases}
\displaystyle
\frac{B_t^k}{IM_{k,t}^{D,\$}},
&IM_{k,t}^{D,\$}>0\\[9pt]
1,&IM_{k,t}^{D,\$}=0
\end{cases}
}
\]

**63.**

\[
\boxed{
B_t^{ara}+B_t^{nihai}
\leq B_t^{IM,\$}
}
\]

**64.**

\[
\boxed{
V_{j,t}^D
=
F_{j,t}^D
-
IM_{j,\mathrm{nihai},t}^{D,R}
-
IM_{j,\mathrm{ara},t}^{D,R}
}
\]

**65.**

\[
\boxed{
\widetilde V_{j,t}
=
V_{j,t}^D
\left[
1-
\beta_j(1-\rho_{\mathrm{ara},t})
\min\left(
1,
\frac{IM_{j,\mathrm{ara},t}^{D,R}}
{\max(\epsilon_Y,V_{j,t}^D)}
\right)
\right]
}
\]

**66.**

\[
\boxed{
\lambda_t=
\min\left[
1,\,
\frac{
Y_t^{cred}e^{\varepsilon_t^Y/100}
}{
\max\left(\epsilon_Y,\sum_j\widetilde V_{j,t}\right)
}
\right]
}
\]

**67.**

\[
\boxed{
\begin{aligned}
F_{j,t}
={}&
\rho_{\mathrm{nihai},t}
IM_{j,\mathrm{nihai},t}^{D,R}\\
&+\lambda_t
\left(
\widetilde V_{j,t}
+\rho_{\mathrm{ara},t}
IM_{j,\mathrm{ara},t}^{D,R}
\right)
\end{aligned}
}
\]

**68.**

\[
\boxed{
\begin{aligned}
F_{C,t}^D&=C_t^D,&F_{C,t}&=C_t\\
F_{I,t}^D&=I_t^D,&F_{I,t}&=I_t\\
F_{G,t}^D&=G_t^D,&F_{G,t}&=G_t\\
F_{EX,t}^D&=EX_t^{D,R},&F_{EX,t}&=EX_t
\end{aligned}
}
\]

**69.**

\[
\boxed{
IM_t=
\sum_j
\left[
\rho_{\mathrm{nihai},t}
IM_{j,\mathrm{nihai},t}^{D,R}
+
\lambda_t\rho_{\mathrm{ara},t}
IM_{j,\mathrm{ara},t}^{D,R}
\right]
}
\]

**70.**

\[
\boxed{
Y_t=\lambda_t\sum_j\widetilde V_{j,t}
}
\]

**71.**

\[
\boxed{
Y_t=C_t+I_t+G_t+EX_t-IM_t
}
\]

**72.**

\[
\boxed{
NX_t=EX_t-IM_t
}
\]

**73.**

\[
\boxed{
A_t=C_t+I_t+G_t
}
\]

**74.**

\[
\boxed{
Y_t^D=A_t^D+EX_t^{D,R}-IM_t^{D,R}
}
\]

**75.**

\[
\boxed{
Y_t^0=
\min(Y_t^D,Y_t^{pot})
e^{\varepsilon_t^Y/100}
}
\]

**76.**

\[
\boxed{
g_t=
100\left[
\left(\frac{Y_t}{Y_{t-1}}\right)^{12}-1
\right]
}
\]

**77.**

\[
\boxed{
g_t^{12}
=
100\left(\frac{Y_t}{Y_{t-12}}-1\right)
}
\]

**78.**

\[
\boxed{
g_t^0=
100\left[
\left(\frac{Y_t^0}{Y_{t-1}^0}\right)^{12}-1
\right]
}
\]

**79.**

\[
\boxed{
g_t^{0,12}
=
100\left(\frac{Y_t^0}{Y_{t-12}^0}-1\right)
}
\]

**80.**

\[
\boxed{
b_t=5.5+0.40(g_t^K-5.5)
}
\]

**81.**

\[
\boxed{
u_t=
\operatorname{clip}\left[
u_{t-1}
+\frac{0.25}{12}(b_t-g_t)
-j_t,
0,100
\right]
}
\]

**82.**

\[
\boxed{
u_t^D=
\operatorname{clip}\left[
u_{t-1}
+\frac{0.25}{12}(b_t-g_t^0)
-j_t,
0,100
\right]
}
\]

**83.**

\[
\boxed{
H_t=
100\max\left(
0,\frac{Y_t^D-Y_t}{Y_t}
\right)
}
\]

**84.**

\[
\boxed{
\bar H_t=
0.65\bar H_{t-1}+0.35H_t
}
\]

**85.**

\[
\boxed{
\begin{aligned}
IM_t^\$=
\sum_j\Big[
&\rho_{\mathrm{nihai},t}
IM_{j,\mathrm{nihai},t}^{D,\$}\\
&+\lambda_t\rho_{\mathrm{ara},t}
IM_{j,\mathrm{ara},t}^{D,\$}
\Big]
\end{aligned}
}
\]

**86.**

\[
\boxed{
RES_t^\$=
RES_t^{pre}-DS_t-IM_t^\$
}
\qquad(\Gamma_t^{DS}=0)
\]

**87.**

\[
\boxed{
IC_t=
\begin{cases}
\displaystyle
\frac{RES_t^\$}{
\frac1{12}\sum_{\ell=0}^{11}
\widehat{IM}_{t+\ell\mid t}^{D,\$}
},
&IM_t^{D,\$}>0\\[12pt]
+\infty,&IM_t^{D,\$}=0
\end{cases}
}
\]

**88.**

\[
\boxed{
\phi_t^{cover}
=
\operatorname{clip}
\left(
1-\frac{IC_t}{IC^\star},
0,1
\right)
}
\]

**89.**

\[
\boxed{
\phi_t^{short}
=
\begin{cases}
\displaystyle
1-
\frac{B_t^{ara}+B_t^{nihai}}
{IM_t^{D,\$}},
&IM_t^{D,\$}>0\\[10pt]
0,&IM_t^{D,\$}=0
\end{cases}
}
\]

**90.**

\[
\boxed{
FX_t=
100\max\left(
\phi_t^{cover},\phi_t^{short}
\right)
}
\]

**91.**

\[
\boxed{
\overline{FX}_t=
\frac1{12}\sum_{k=0}^{11}FX_{t-k}
}
\]

**92.**

\[
\boxed{
\overline{FX}_{t-6:t-1}
=
\frac1{6}\sum_{k=1}^{6}FX_{t-k}
}
\]

**93.**

\[
\boxed{
\Xi_t=
\max\left(
FX_t,\,
0.75\overline{FX}_{t-6:t-1}
\right)
}
\]

**94.**

\[
\boxed{
s_t=
\operatorname{clip}
\left(
\frac{\Xi_t}{100},0,1
\right)
}
\]

**95.**

\[
\boxed{
q_t=
\begin{cases}
s_t,&s_t\geq q_{t-1}\\[4pt]
q_{t-1}+0.10(s_t-q_{t-1}),&s_t<q_{t-1}
\end{cases}
}
\]

**96.**

\[
\boxed{
\begin{aligned}
\widehat{\pi}_t={}&
\pi_t^e\\
&+\frac{0.60}{12}
(\mu_t-g_t^{0,12}-\pi_t^e)\\
&+\frac{1.20}{12}(u^n-u_t^D)\\
&+\frac{1.80}{12}\bar H_t\\
&+\frac{0.10}{12}V_t
\end{aligned}
}
\]

**97.**

\[
\boxed{
\pi_t^{trend}
=
\operatorname{clip}
(\widehat{\pi}_t,-60,300)
}
\]

**98.**

\[
\boxed{
p_{M,t}^{*,\$}
=
\begin{cases}
\displaystyle
p_{M,t-1}^{*,\$}
\frac{
\sum_k p_{k,t}^{*,\$}
\sum_j IM_{j,k,t-1}^{D,R}
}{
\sum_k p_{k,t-1}^{*,\$}
\sum_j IM_{j,k,t-1}^{D,R}
},
&
\displaystyle\sum_j\sum_k IM_{j,k,t-1}^{D,R}>0
\\[14pt]
p_{M,t-1}^{*,\$},
&
\displaystyle\sum_j\sum_k IM_{j,k,t-1}^{D,R}=0
\end{cases}
}
\]

**99.**

\[
\boxed{
\chi_t^{kur}
=
\kappa_{kur}\theta_t^{ith}
\max\left[
0,\,
\ln\left(
\frac{e_tp_{M,t}^{*,\$}}
{e_{t-1}p_{M,t-1}^{*,\$}}
\right)
\right]
}
\]

**100.**

\[
\boxed{
\mathcal P_t=
\mathcal P_{t-1}
\left(
1+\frac{\pi_t^{trend}}{100}
\right)^{1/12}
e^{\chi_t^{kur}+\omega_t/100}
}
\]

**101.**

\[
\boxed{
\pi_t^{12}
=
100\left(
\frac{\mathcal P_t}{\mathcal P_{t-12}}-1
\right)
}
\]

**102.**

\[
\boxed{
\pi_{t+1}^e
=
0.55\pi_t^e+0.45\pi_t^{12}
}
\]

**103.**

\[
\boxed{
\begin{aligned}
p_t^{ag,N}={}&
p_{t-1}^{ag,N}
\frac{\mathcal P_t}{\mathcal P_{t-1}}\\
&\times
\left(
\frac{M2_t/(\mathcal P_tY_t)}
{M2_{t-1}/(\mathcal P_{t-1}Y_{t-1})}
\right)^{0.35}\\
&\times
\left(
\frac{C_t/Y_t}{C_{t-1}/Y_{t-1}}
\right)^{0.25}\\
&\times
\left(
\frac{A_{t-1}^{ag}}{A_t^{ag}}
\right)^{0.65}
\end{aligned}
}
\]

**104.**

\[
\boxed{
\begin{aligned}
A_t^{ag}=A_{t-1}^{ag}\exp\Bigg\{
\frac1{12}\Bigg[
&0.025(K_{t-12}-K_{t-24})\\
&\quad\times(1+0.10(Q_{t-12}-1))\\
&+0.015(Q_{t-12}-Q_{t-24})\\
&+0.035(N_{t-12}-N_{t-24})\\
&+0.015(B_{t-12}-B_{t-24})\\
&-0.015
\left(
\max\left(
0,\frac{\overline{FX}_t-65}{35}
\right)
\right)^2
\Bigg]\Bigg\}
\end{aligned}
}
\]

**105.**

\[
\boxed{
\begin{aligned}
A_t^{ind}=A_{t-1}^{ind}\exp\Bigg\{
\frac1{12}\Bigg[
&0.060(1+0.04P_{t-12}^{yat})\\
&\quad\times(Z_{t-12}-Z_{t-24})\\
&+0.025(J_{t-12}-J_{t-24})\\
&-0.050
\left(
\max\left(
0,\frac{\overline{FX}_t-65}{35}
\right)
\right)^2
\Bigg]\Bigg\}
\end{aligned}
}
\]

**106.**

\[
\boxed{
A_0^{ag}=1,\qquad A_0^{ind}=1
}
\]

**107.**

\[
\boxed{
\overline Y_y=
\frac1{12}\sum_{m=1}^{12}Y_{y,m}
}
\]

**108.**

\[
\boxed{
\overline{\mathcal P}_y=
\frac1{12}\sum_{m=1}^{12}\mathcal P_{y,m}
}
\]

**109.**

\[
\boxed{
g_y^{GSYİH}
=
100\left(
\frac{\overline Y_y}{\overline Y_{y-1}}-1
\right)
}
\]

**110.**

\[
\boxed{
\pi_y^{yıllık}
=
100\left(
\frac{\overline{\mathcal P}_y}
{\overline{\mathcal P}_{y-1}}-1
\right)
}
\]

**111.**

\[
\boxed{
u_y^{yıllık}
=
\frac1{12}\sum_{m=1}^{12}u_{y,m}
}
\]

**112.**

\[
\boxed{
A_0=Y_0-EX_0+IM_0
}
\]

**113.**

\[
\boxed{
S_t^{dom}
=
Y_t-C_t-G_t
=
I_t+NX_t
}
\]

**114.**

\[
\boxed{
\varepsilon_t^Y=0
}
\]

**115.**

\[
\boxed{
\omega_t=0
}
\]

**116.**

\[
\boxed{
f_t=0
}
\]

**117.**

\[
\boxed{
j_t=0
\qquad
\text{(doğrudan istihdam müdahalesi yoksa)}
}
\]

**118.**

\[
\boxed{
u^n=8,\qquad m_t=0.74,\qquad i_a=0.50
}
\]

**119.**

\[
\boxed{
E_0=1
}
\]

**120.**

\[
\boxed{
z_0=0
}
\]

**121.**

\[
\boxed{
\mathcal R_0=100
}
\]

**122.**

\[
\boxed{
d_t^{world}=1
\qquad
\text{(dış talep şoku yoksa)}
}
\]

**123.**

\[
\boxed{
g_t^G=0
\qquad
\text{(kamu tüketimi müdahalesi yoksa)}
}
\]

**124.**

\[
\boxed{
j\in\{C,I,G,EX\},
\qquad
k\in\{\mathrm{nihai},\mathrm{ara}\}
}
\]

**125.**

\[
\boxed{
\begin{gathered}
0\leq a_t\leq100\\
0\leq d_t^{world}\leq1\\
0\leq\omega_t^N\leq1\\
0\leq\rho_{k,t}\leq1\\
0\leq\eta_t^{EX},\eta_t^{TR}\leq1\\
0\leq\beta_j\leq1-\epsilon_0
\end{gathered}
}
\]

**126.**

\[
\boxed{
\begin{gathered}
\alpha_{j,k,t}^{zor}\geq0,\qquad
\alpha_{j,k,t}^{esnek}\geq0\\
\varepsilon_k\geq0,\qquad
\varepsilon_{EX}\geq0\\
0\leq\sum_k\alpha_{j,k,t}^{zor}\leq1-\epsilon_0\\
0\leq\sum_k\alpha_{j,k,t}^{etkin}\leq1-\epsilon_0\\
0\leq\xi_t^{EX}\leq\overline\xi^{EX}
\end{gathered}
}
\]

**127.**

\[
\boxed{
\begin{gathered}
Y_t,\mathcal P_t,M2_t,B_t^N,e_t>0\\
C_t,I_t,G_t,EX_t,IM_t\geq0\\
RES_t^\$,DEBT_t^\$\geq0\\
RES_t^{min}\geq0\\
L_t^{talep,\$}\geq0,\qquad TR_t^\$\geq0\\
PR_t^{eski}\geq0
\end{gathered}
}
\]

**128.**

\[
\boxed{
\begin{gathered}
\delta_t^e>-1,\qquad
\pi_t^e>-100,\qquad
i^{ext}>-100\\
IC^\star>0,\qquad
\overline\gamma^{IM}\geq0\\
\kappa_D\geq0,\qquad
n\in\mathbb N_{>0}\\
p_{EX,t}^{*,\$}>0,\qquad
p_{k,t}^{*,\$}>0\\
\kappa_{kur}\geq0,\qquad
0\leq\theta_t^{ith}\leq1
\end{gathered}
}
\]

**129.**

\[
\boxed{
\operatorname{clip}(x,a,b)
=
\min\bigl(b,\max(a,x)\bigr)
}
\]

**130.**

\[
\boxed{
\begin{gathered}
0<\epsilon_0<1\\
\epsilon_Y=\epsilon_0Y_0>0\\
\epsilon_\$=\epsilon_0IM_0^{D,\$}>0
\end{gathered}
}
\]

**131.**

\[
\boxed{
p_{M,0}^{*,\$}=100
}
\]

**132.**

\[
\boxed{
G_0^D=G_0
}
\]

**133.**

\[
\boxed{
\sum_{t=1}^{\infty}PR_t^{eski}=DEBT_0^\$
}
\]

133. eşitlik, başlangıçtaki dış borcun tamamının planlandığı şekilde geri ödendiği ve borç silinmesi bulunmadığı durum için geçerlidir. Başlangıç borçları, oyun içinde alınan yeni kredilerin geri ödeme takvimiyle mükerrer kaydedilmez.

---

| Değişken | Tanımı ve birimi |
|---|---|
| \(t\) | Aylık zaman indisi; başlangıç Ocak 1972 |
| \(y\) | Takvim yılı |
| \(m\) | Takvim yılı içindeki ay |
| \(k\) | İthalat kategorisi veya toplama indisi; ilgili formüle göre |
| \(\ell\) | Tahmin ufku; ay |
| \(t_y\) | İlgili yılın Aralık ayı |
| \(i_t^{CB}\) | TCMB reeskont faizi; yıllık % |
| \(i_t\) | Nominal özel banka kredi faizi; yıllık %, reeskont faizine bağlı tavan uygulanır |
| \(i_a\) | Banka faizinin hedef faize uyum katsayısı; boyutsuz, 0,50 |
| \(s_t^{faiz}\) | Banka kredi faizinin reeskont faizine göre hedef marjı; yıllık yüzde puan |
| \(r_t\) | Beklenen reel banka kredi faizi; yıllık % |
| \(r_y\) | Yıllık ortalama beklenen reel banka kredi faizi; yıllık % |
| \(V_t\) | Negatif reel faiz baskısı; yüzde puan ölçeğinde |
| \(M2_t\) | Nominal M2 para arzı stoku; cari TL |
| \(\mu_t\) | Son 12 aylık M2 büyümesi; % |
| \(\mu_{t-1}\) | Önceki ayda hesaplanan son 12 aylık M2 büyümesi; % |
| \(\mu_y\) | Yıl sonu itibarıyla son 12 aylık M2 büyümesi; % |
| \(B_t^N\) | Nominal özel sektör banka kredisi stoku; cari TL |
| \(B_y^N\) | Yıl sonundaki nominal özel sektör banka kredisi stoku; cari TL |
| \(B_t^R\) | Başlangıç fiyatlarıyla reel özel sektör banka kredisi stoku; reel TL |
| \(B_0^R\) | Başlangıç reel özel banka kredisi stoku; reel TL |
| \(z_t\) | Reel kredi stokunun potansiyel GSYİH'ya göre başlangıçtan sapması; 100 ile ölçeklendirilmiş logaritmik oran |
| \(z_0\) | Başlangıç reel kredi yeterliliği; 0 |
| \(d_t^B\) | Kredi genişlemesinin tüketim talebi büyümesine katkısı; yıllık yüzde puan |
| \(Y_t^{cred}\) | Kredi kısıtı altında kullanılabilir üretim kapasitesi; yıllıklandırılmış reel TL |
| \(a_t\) | Dışsal tasarruf/yatırım finansmanı hedefi; %, gerçekleşmiş tasarruf oranından farklı |
| \(a_t^{I,ger}\) | Gerçekleşen yatırımın GSYİH'ya oranı; % |
| \(I_t^{etkin}\) | Geçmiş gerçekleşen yatırımların üretken kapasiteye katkı yapan etkin payı; GSYİH'ya oran, % |
| \(E_t\) | Yatırım etkinliği katsayısı; boyutsuz |
| \(E_0\) | Başlangıç yatırım etkinliği; 1 |
| \(K_t\) | Tarımsal kooperatifleşme düzeyi; 1–4 |
| \(Q_t\) | Kooperatifler Bankası düzeyi; 1–4 |
| \(P_t^{yat}\) | Halk Sektörünün kalkınma planlarına entegrasyonu; 0/1 |
| \(N_t\) | Kümülatif Köykent yatırım eylemi sayısı; boyutsuz sayaç |
| \(B_t\) | Kooperatif üst birlikleri politika durumu; 0/1; banka kredi stokundan farklı |
| \(Z_t\) | Elektronik ve yüksek teknoloji politikası; 0/1 |
| \(J_t\) | Kümülatif KİT yeniden yapılandırma eylemi sayısı; boyutsuz sayaç |
| \(\bar u_{t-24:t-13}\) | 13–24 ay önceki ortalama işsizlik oranı; % |
| \(L_t\) | Gecikmeli işsizliğin yatırım kapasitesine etkisi; boyutsuz çarpan |
| \(g_t^K\) | Potansiyel üretim kapasitesinin yıllık büyüme hızı; % |
| \(Y_t^{pot}\) | Potansiyel GSYİH; yıllıklandırılmış reel TL |
| \(Y_0^{pot}\) | Başlangıç potansiyel GSYİH; yıllıklandırılmış reel TL |
| \(I_t^D\) | Planlanan gayrisafi yatırım; yıllıklandırılmış reel TL |
| \(I_t\) | Gerçekleşen gayrisafi yatırım; yıllıklandırılmış reel TL |
| \(G_t^D\) | Planlanan kamu nihai tüketimi; yıllıklandırılmış reel TL |
| \(G_0^D\) | Başlangıç kamu nihai tüketim planı; \(G_0\)'a eşit |
| \(G_t\) | Gerçekleşen kamu nihai tüketimi; yıllıklandırılmış reel TL |
| \(g_t^G\) | Kamu nihai tüketiminin hedef yıllık büyüme oranı; % |
| \(h_t\) | Tüketimin önceki dönem iç harcamalarına oranı; boyutsuz |
| \(m_t\) | Marjinal tüketim eğilimi; boyutsuz, 0,74 |
| \(c_t^*\) | Hedef tüketim büyümesi; yıllık % |
| \(c_t^0\) | İlave müdahaleler öncesi tüketim büyümesi; yıllık % |
| \(c_t\) | Müdahaleler sonrası planlanan tüketim büyümesi; yıllık % |
| \(C_t^D\) | Planlanan tüketim; yıllıklandırılmış reel TL |
| \(C_t\) | Gerçekleşen tüketim; yıllıklandırılmış reel TL |
| \(D_t\) | Deflasyonun talep büyümesine katkısı; yıllık yüzde puan |
| \(f_t\) | Maliye politikasının tüketim talebi büyümesine katkısı; yıllık yüzde puan |
| \(A_t^D\) | Planlanan toplam yurt içi nihai harcamalar; yıllıklandırılmış reel TL |
| \(A_t\) | Gerçekleşen toplam yurt içi nihai harcamalar; yıllıklandırılmış reel TL |
| \(A_0\) | Başlangıç toplam yurt içi nihai harcamaları; yıllıklandırılmış reel TL |
| \(g_t^D\) | Planlanan iç harcamaların aylık değişimden yıllıklandırılmış büyümesi; % |
| \(e_t\) | Nominal döviz kuru; cari TL/USD |
| \(e_0\) | Başlangıç nominal döviz kuru; TL/USD |
| \(\delta_t^e\) | Nominal döviz kurunun aylık değişimi; ondalık oran, %10 için 0,10 |
| \(\mathcal R_t\) | Reel döviz kuru endeksi; 100 tabanlı, artışı TL'nin reel değer kaybı |
| \(\mathcal R_0\) | Başlangıç reel döviz kuru endeksi; 100 |
| \(\mathcal P_t^*\) | Dış fiyat endeksi; boyutsuz |
| \(\mathcal P_0^*\) | Başlangıç dış fiyat endeksi; boyutsuz |
| \(\xi_t^{EX}\) | Potansiyel üretime göre ihracat kapasitesi katsayısı; ondalık oran |
| \(\overline\xi^{EX}\) | İhracat kapasitesi katsayısının üst sınırı; ondalık oran |
| \(\Delta\xi_t^{eylem}\) | İhracat kapasitesi katsayısında ekonomi eylemlerinden kaynaklanan değişim; ondalık oran puanı |
| \(\ell_I\) | İhracat kapasitesi eylemlerinin gecikmesi; ay |
| \(\delta_t^\xi\) | İhracat kapasitesi katsayısının aşınması veya başka kullanımlara tahsisi; ondalık oran puanı |
| \(EX_t^{cap,R}\) | Azami reel ihracat kapasitesi; yıllıklandırılmış reel TL |
| \(EX_t^{D,R}\) | Planlanan reel ihracat; yıllıklandırılmış reel TL |
| \(EX_t\) | Gerçekleşen reel ihracat; yıllıklandırılmış reel TL |
| \(EX_0\) | Başlangıç reel ihracat; yıllıklandırılmış reel TL |
| \(d_t^{world}\) | Dünya talebinin ihracat kapasitesinden kullanılabilir kıldığı pay; boyutsuz, 0–1 |
| \(\varepsilon_{EX}\) | İhracatın reel kura duyarlılığı; boyutsuz esneklik |
| \(p_{EX,t}^{*,\$}\) | Reel ihracat hacmini cari dolara dönüştüren katsayı; USD/reel TL |
| \(EX_t^\$\) | Ay içerisinde gerçekleşen ihracatın cari dolar değeri; USD |
| \(EX_t^{cash,\$}\) | Resmî döviz havuzuna giren aylık ihracat tahsilatı; USD |
| \(\eta_t^{EX}\) | İhracat gelirlerinin resmî döviz havuzuna aktarım oranı; boyutsuz |
| \(TR_t^\$\) | Aylık toplam işçi dövizleri; USD |
| \(TR_t^{available,\$}\) | Resmî havuza ulaşan aylık işçi dövizleri; USD |
| \(\eta_t^{TR}\) | İşçi dövizlerinin resmî havuza aktarım oranı; boyutsuz |
| \(n\) | Yeni dış kredilerin ortak anapara geri ödeme süresi; ay |
| \(i^{ext}\) | Dış borcun yıllık efektif dolar faiz oranı; % |
| \(PR_t\) | Cari ayın toplam dış borç anapara ödemesi; USD |
| \(PR_t^{eski}\) | Oyun başlangıcından önce alınmış dış borçların cari aya düşen anapara taksiti; USD; başlangıç ödeme takviminden gelir |
| \(INT_t\) | Cari ayın dış borç faiz ödemesi; USD |
| \(DS_t\) | Cari ayın toplam dış borç servisi; USD |
| \(DEBT_t^\$\) | Dış borç anapara stoku; USD |
| \(DEBT_0^\$\) | Oyun başlangıcındaki mevcut dış borç anapara stoku; USD |
| \(DEBT_t^{limit,\$}\) | Azami dış borç stoku; USD |
| \(\kappa_D\) | Dış borç stokunun yıllık döviz gelirlerine göre izin verilen katı; boyutsuz |
| \(L_t^{talep,\$}\) | Cari ayda talep edilen yeni dış kredi; USD |
| \(L_t^{new,\$}\) | Cari ayda alınabilen yeni dış kredi; USD; başlangıç borç takviminden ayrı kaydedilir |
| \(RES_t^{pre}\) | Dış borç ve ithalat ödemeleri öncesi kullanılabilir döviz; USD |
| \(RES_t^\$\) | Ay sonu kullanılabilir döviz rezervi; USD |
| \(RES_t^{min}\) | Hedeflenen asgari döviz rezervi; USD, negatif olamaz |
| \(\Gamma_t^{DS}\) | Dış borç servisinin karşılanamayan kısmı; USD |
| \(B_t^{IM,\$}\) | İthalat için kullanılabilir aylık döviz bütçesi; USD |
| \(j\) | Nihai harcama kategorisi; \(C,I,G,EX\) |
| \(k\) | İthalat kullanım kategorisi; nihai mal veya ara malı |
| \(\alpha_{j,k,t}^{zor}\) | İkamesi güç, zorunlu ithalat katsayısı; boyutsuz; esnek ithalat sınırlandırılırken korunur |
| \(\alpha_{j,k,t}^{esnek}\) | Fiyat değişimine duyarlı ithalat katsayısı; boyutsuz |
| \(\alpha_{j,k,t}^{ham}\) | Sınırlandırmadan önceki ithalat katsayısı; boyutsuz |
| \(\alpha_{j,k,t}^{etkin}\) | Zorunlu ithalatı koruyup esnek ithalatı sınırlandıran gerçekleşebilir katsayı; boyutsuz |
| \(\varepsilon_k\) | İthalat kategorisinin reel kura duyarlılığı; boyutsuz esneklik |
| \(F_{j,t}^D\) | İlgili kategoride planlanan nihai harcama; yıllıklandırılmış reel TL |
| \(F_{j,t}\) | İlgili kategoride gerçekleşen nihai harcama; yıllıklandırılmış reel TL |
| \(IM_{j,k,t}^{D,R}\) | Kategori bazında planlanan reel ithalat; yıllıklandırılmış reel TL |
| \(IM_t^{D,R}\) | Toplam planlanan reel ithalat; yıllıklandırılmış reel TL |
| \(p_{k,t}^{*,\$}\) | İthalat kategorisinin reel hacmini cari dolara dönüştüren katsayı; USD/reel TL |
| \(IM_{j,k,t}^{D,\$}\) | Kategori bazında cari ayın planlanan dolar ithalatı; USD |
| \(IM_{k,t}^{D,\$}\) | Kullanım kategorisine göre aylık ithalat ihtiyacı; USD |
| \(IM_t^{D,\$}\) | Toplam planlanan aylık ithalat ihtiyacı; USD |
| \(B_t^{ara}\) | Ara malı ithalatına ayrılan aylık döviz bütçesi; USD |
| \(B_t^{nihai}\) | Nihai mal ithalatına ayrılan aylık döviz bütçesi; USD |
| \(\omega_t^N\) | Nihai mal ithalatına öncelik veren tahsis katsayısı; boyutsuz, 0–1 |
| \(\rho_{k,t}\) | İlgili ithalat kategorisinin finansman oranı; boyutsuz, 0–1 |
| \(V_{j,t}^D\) | Planlanan yerli katma değer; yıllıklandırılmış reel TL |
| \(\widetilde V_{j,t}\) | Ara malı kıtlığının ithalat bağımlılığıyla orantılı etkisi sonrasındaki yerli katma değer; yıllıklandırılmış reel TL |
| \(\beta_j\) | Ara malı ithalatı yetersizliğine azami üretim duyarlılığı; boyutsuz |
| \(\lambda_t\) | Yerli üretimin gerçekleşme katsayısı; boyutsuz, 0–1 |
| \(IM_t\) | Gerçekleşen reel ithalat; yıllıklandırılmış reel TL |
| \(IM_0\) | Başlangıç reel ithalat; yıllıklandırılmış reel TL |
| \(IM_t^\$\) | Gerçekleşen aylık ithalat ödemesi; USD |
| \(NX_t\) | Gerçekleşen reel net ihracat; yıllıklandırılmış reel TL |
| \(Y_t^D\) | Planlanan reel GSYİH; yıllıklandırılmış reel TL |
| \(Y_t\) | Gerçekleşen reel GSYİH; yıllıklandırılmış reel TL |
| \(Y_0\) | Başlangıç reel GSYİH; yıllıklandırılmış reel TL |
| \(Y_t^0\) | Cari arz darboğazlarından arındırılmış karşılaştırma üretimi; yıllıklandırılmış reel TL |
| \(g_t\) | Aylık GSYİH değişiminden yıllıklandırılmış büyüme; % |
| \(g_t^{12}\) | Son 12 aylık reel GSYİH büyümesi; % |
| \(g_t^0\) | Karşılaştırma üretiminin aylık değişimden yıllıklandırılmış büyümesi; % |
| \(g_t^{0,12}\) | Karşılaştırma üretiminin son 12 aylık büyümesi; % |
| \(b_t\) | İşsizlik oranını sabit tutan referans büyüme; yıllık % |
| \(u_t\) | Gerçekleşen işsizlik oranı; % |
| \(u^n\) | Referans işsizlik oranı; %8 |
| \(u_t^D\) | Cari darboğazlardan arındırılmış karşılaştırma işsizliği; % |
| \(j_t\) | İstihdam politikalarının işsizlik oranına doğrudan etkisini gösteren dışsal değişken; aylık yüzde puan. Pozitif değer işsizliği azaltır, negatif değer artırır. Kişi sayısından hesaplanmaz. |
| \(H_t\) | Karşılanamayan toplam talep oranı; % |
| \(\bar H_t\) | Gecikmeli karşılanamayan talep baskısı; % |
| \(\gamma_t^{IM}\) | İthalat ihtiyacının tahmini aylık logaritmik büyümesi; boyutsuz |
| \(\overline\gamma^{IM}\) | İthalat tahmini büyümesinin aylık üst sınırı; boyutsuz |
| \(\widehat{IM}_{t+\ell\mid t}^{D,\$}\) | \(t\) ayında, \(t+\ell\) için öngörülen aylık ithalat ihtiyacı; USD |
| \(IC_t\) | İthalat karşılama süresi; ay |
| \(IC^\star\) | Referans ithalat karşılama süresi; ay |
| \(\phi_t^{cover}\) | Rezerv yetersizliği şiddeti; boyutsuz, 0–1 |
| \(\phi_t^{short}\) | İthalat finansman açığı şiddeti; boyutsuz, 0–1 |
| \(FX_t\) | Döviz krizi endeksi; 0–100 endeks puanı |
| \(\overline{FX}_t\) | Son 12 ayın ortalama döviz krizi endeksi; endeks puanı |
| \(\overline{FX}_{t-6:t-1}\) | Önceki altı ayın ortalama döviz krizi endeksi; endeks puanı |
| \(\Xi_t\) | Gecikmeli döviz baskısı; endeks puanı |
| \(s_t\) | Normalleştirilmiş döviz krizi baskısı; boyutsuz, 0–1 |
| \(q_t\) | Asimetrik atalet içeren etkin döviz baskısı; boyutsuz, 0–1 |
| \(\widehat{\pi}_t\) | Hesaplanan temel yıllık enflasyon eğilimi; % |
| \(\pi_t^{trend}\) | Sınırlandırılmış yıllık enflasyon eğilimi; % |
| \(\pi_t^e\) | Beklenen yıllık enflasyon; % |
| \(\pi_t^{12}\) | Gerçekleşen son 12 aylık enflasyon; % |
| \(\chi_t^{kur}\) | Kur ve ithalat fiyatlarından kaynaklanan aylık logaritmik fiyat değişimi; boyutsuz |
| \(\kappa_{kur}\) | İthalat maliyetlerinin fiyatlara geçişkenlik katsayısı; boyutsuz ve negatif olmayan |
| \(\theta_t^{ith}\) | İthal maliyetlerinin tüketici fiyatlarına yansıyan ağırlığı; boyutsuz, 0–1 |
| \(p_{M,t}^{*,\$}\) | Dolar cinsinden ağırlıklı ithalat fiyat endeksi; boyutsuz, başlangıç 100 |
| \(p_{M,0}^{*,\$}\) | Başlangıç ithalat fiyat endeksi; 100 |
| \(\mathcal P_t\) | Tüketici fiyat endeksi; boyutsuz |
| \(\mathcal P_0\) | Başlangıç tüketici fiyat endeksi; reel kredi deflatörünün tabanı |
| \(\omega_t\) | Aylık logaritmik fiyat şokunun 100 ile ölçeklendirilmiş değeri |
| \(\varepsilon_t^Y\) | Üretim düzeyi üzerindeki logaritmik şokun 100 ile ölçeklendirilmiş değeri |
| \(p_t^{ag,N}\) | Nominal tarımsal fiyat endeksi |
| \(A_t^{ag}\) | Tarımsal üretim endeksi |
| \(A_t^{ind}\) | Sanayi üretim endeksi |
| \(\overline Y_y\) | Takvim yılının ortalama yıllıklandırılmış reel GSYİH düzeyi; reel TL/yıl |
| \(\overline{\mathcal P}_y\) | Takvim yılının ortalama tüketici fiyat endeksi |
| \(g_y^{GSYİH}\) | Takvim yılları arasındaki reel GSYİH büyümesi; % |
| \(\pi_y^{yıllık}\) | Takvim yılı ortalama fiyat endeksleri arasındaki enflasyon; % |
| \(u_y^{yıllık}\) | Yıllık ortalama işsizlik oranı; % |
| \(S_t^{dom}\) | Gerçekleşen yurt içi brüt tasarruf; yıllıklandırılmış reel TL |
| \(\epsilon_0\) | Boyutsuz küçük pozitif hesaplama sabiti |
| \(\epsilon_Y\) | Yıllıklandırılmış reel TL birimindeki küçük pozitif hesaplama sabiti |
| \(\epsilon_\$\) | Aylık USD ithalat tutarı birimindeki küçük pozitif hesaplama sabiti |
| \(IM_0^{D,\$}\) | Başlangıç aylık dolar ithalat ihtiyacı; pozitif referans |
| \(\operatorname{clip}(x,a,b)\) | \(x\) değerini \([a,b]\) aralığına sınırlayan fonksiyon |
| \(\exp(x)\) | Doğal üstel fonksiyon |
| \(\ln(x)\) | Doğal logaritma |
