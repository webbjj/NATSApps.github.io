//Functions for creating models
const Lsolar=3.828e26, sigma=5.670374419e-8, AU=1.495978707e11;

function linear(x,A,B){
	N=x.length;
	y=[];
	for (let i = 0; i < N; i++) {
		y[i]=A*x[i]+B;
	}
	return y;
}

function powerlaw(x,A,B){
	N=x.length
	y=[]
	for (let i = 0; i < N; i++) {
		y[i]=A*(Math.pow(x[i],B));
	}
	return y;
}

function exponential(x,A,B){
	N=x.length
	y=[]
	for (let i = 0; i < N; i++) {
		y[i]=A*Math.exp(x[i]*B)
	}
	return y;
}

function sinusoidal(x,A,B,C,D){
	N=x.length
	y=[]
	for (let i = 0; i < N; i++) {
		y[i]=A*Math.sin(x[i]*B+C)+D
	}
	return y;
}

function gaussian(x,A,B,C){
	N=x.length
	y=[]
	for (let i = 0; i < N; i++) {
		y[i]=A*Math.exp(-1.0*((x[i]-B)**2.0)/(2.0*C*C))
	}
	return y;
}

function teff(x,lum,alb){
	N=x.length
	y=[]
	for (let i = 0; i < N; i++) {
		let d=Number(x[i])*AU;
		let L=Number(lum)*Lsolar;

    	let teff4=((1-alb/100)*L)/(16*Math.PI*sigma*d*d);

		y[i]=Math.pow(teff4,0.25);
	}
	return y;
}

function teq(x,lum,alb,gh){
	N=x.length
	y=[]
	for (let i = 0; i < N; i++) {
		let d=Number(x[i])*AU;
		let L=Number(lum)*Lsolar;

    	let teff4=((1-alb/100)*L)/(16*Math.PI*sigma*d*d);
    	let tgh=gh*0.5841;
    	let teq4=teff4*(1+3*tgh/4);

		y[i]=Math.pow(teq4,0.25);
	}
	return y;
}

function tsurf(x,lum,alb,gh){

	N=x.length
	y=[]
	for (let i = 0; i < N; i++) {
		let d=Number(x[i])*AU;
		let L=Number(lum)*Lsolar;

    	let teff4=((1-alb/100)*L)/(16*Math.PI*sigma*d*d);
    	let tgh=gh*0.5841;
    	let tsurf4=teff4*(1+3*tgh/4)/0.9;

		y[i]=Math.pow(tsurf4,0.25);
	}
	return y;
}

function vplanet(Mstar,semi){
	let grav=39.478; //au 3 yr-2 msun-1
	let vpl2=grav*Mstar/semi;
	return vpl2**(1.0/2.0);	
}

function period_to_semi(period,mstar,mplanet){
	let grav=39.478; //au 3 yr-2 msun-1
	let mtot=mstar+mplanet;
	let semi3=grav*mtot*(period**2.0)/(4.0*Math.PI*Math.PI);
	return semi3**(1.0/3.0);
}

function semi_to_period(semi,mstar,mplanet){
	let grav=39.478; //au 3 yr-2 msun-1
	let mtot=mstar+mplanet;
	let period2=(4.0*Math.PI*Math.PI)*(semi**3.0)/(grav*mtot);
	return period2**(1.0/2.0);

}

function transit(x,Rs,Rp,Tp,Vp,Off){


	let N=x.length;

	let Depth=1.0-Math.pow(Rp/Rs,2.0);
	let Tingress=2.0*Rp/Vp;
	let Width=2.0*Rs/Vp-Tingress;

	let ntrans=Math.ceil(x[N-1]/Tp);

	let ttrans=[];
	let phi=Off;

	while (phi>Tp){
		phi=phi-Tp
	}

	for (let i = 0; i < ntrans; i++) {
			ttrans[i]=phi+i*Tp;
	}

	let y=new Array(N).fill(1.0);

	for (let j = 0; j < ttrans.length; j++){

		for (let i = 0; i < N; i++) {

			tdiff=x[i]-ttrans[j];

			if (Math.abs(tdiff)<Width/2.){
				y[i]=Depth;
			} else if (Math.abs(tdiff)<(Width/2.0+Tingress) && tdiff<0){
				y[i]=yinterp(x[i],x[i-1],ttrans[j]-Width/2.0,y[i-1],Depth)
			} else if (Math.abs(tdiff)<(Width/2.0+Tingress) && tdiff>0){
				y[i]=yinterp(x[i],ttrans[j]+Width/2.0,ttrans[j]+Width/2.0+Tingress,Depth,1.0)
			}


		}

	}
	
	return y;
}

function yinterp(x,x1,x2,y1,y2){
	m=(y2-y1)/(x2-x1)
	b=y1-m*x1

	return m*x+b;
}