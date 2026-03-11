// Get elements from document
const modformula=document.getElementById('modelFormula');
const teqbutton=document.getElementById('tequilibrium');
const teffbutton=document.getElementById('teffective');
const tsurfbutton=document.getElementById('tsurface');

//Calculate model data and then makePlot
function updateModel() {

	var Lstar=Number(document.getElementById('Lstar').value);
	var Albedo=Number(document.getElementById('Albedo').value);
	var Semi=Number(document.getElementById('Semi').value);
	var Ggas=Number(document.getElementById('Ggas').value);

	let N = 1000;
	let xmod=[];
	let ymod=[];

	const xminNum=Math.max(Number(xmin),0.001);
	const xmaxNum=Number(xmax);
	const dx=xmaxNum-xminNum;

	for (let i = 0; i < N; i++) {
		xmod[i]=xminNum+i*dx/(N-1);
	}

	var ttype, tlocal;

	if (teqbutton.checked){
			ymod=teff(xmod,Lstar,Albedo);
			ttype='T<sub>eq</sub> Model: A='+Albedo;
			tlocal=teff([Semi],Lstar,Albedo)[0];
	} else if (teffbutton.checked){
			ymod=teq(xmod,Lstar,Albedo,Ggas);
			ttype='T<sub>eff</sub> Model: A='+Albedo+', gh='+Ggas;
			tlocal=teq([Semi],Lstar,Albedo,Ggas)[0];
	} else {
			ymod=tsurf(xmod,Lstar,Albedo,Ggas);
			ttype='T<sub>surf</sub> Model: A='+Albedo+', gh=' + Ggas;
			tlocal=tsurf([Semi],Lstar,Albedo,Ggas)[0];
	}

	//Only keep real values of ymod
	const filtered = xmod
	    .map((x, i) => ({ x: x, y: ymod[i] }))
	    .filter(point => Number.isFinite(point.y));

	//Create model for plotting
	model = {
	    x: filtered.map(p => p.x),
	    y: filtered.map(p => p.y),
	    type: 'scatter',
	    mode: 'lines',
	    name: ttype,
	    line: {color:'orange', width:2},
	    marker: {color:'orange'}
	};

	let semis=[Semi,Semi];
	let ys=[0.,ymax];

	/*
	if (Semi > xmax){
		xmax=Semi;
		document.getElementById('xmax').value=String(xmax);
	}

	if (tlocal > ymax){
		ymax=tlocal;
		document.getElementById('ymax').value=String(ymax);
	}
	*/

	data = {
	    x: semis,
	    y: ys,
	    type: 'scatter',
	    mode: 'lines',
	    name: 'Planet: ' + Semi + ' AU',
	    line: {color:'#4DA3FF', dash:'dash', width:2},
	    marker: {color:'#4DA3FF'}
	};

	let hzdata=habitable_zone(model.x,model.y);
	let hzmin=hzdata[0];
	let hzmax=hzdata[1]

	range=null

	if (hzmin != null || hzmax != null){

		range = {
	    	x: [hzmin,hzmax,hzmax,hzmin],
	        y: [ymin,ymin,ymax,ymax],
	        fill: 'toself',
	        fillcolor:'rgba(100,200,100,0.25)',
	        line:{color:'rgba(0,0,0,0)'}, type:'scatter',mode:'none',
	        name:'Habitable Zone', showlegend:true
	    }

	}

	annos = [];  // clear previous annotations

	if (false) {

	annos.push({
	    x: Semi,
	    y: tlocal,
	    xref: 'x',
	    yref: 'y',
	    text: `d = ${Semi.toFixed(2)} AU<br>T = ${tlocal.toFixed(1)} K`,
	    showarrow: true,
	    arrowhead: 2,
	    ax: 40,
	    ay: -40,
	    bgcolor: 'rgba(0,0,0,0.7)',
	    font: { color: 'white' }
	});

	}

	makePlot()

}

xmin=0.;
xmax=20.0;
ymin=0.;
ymax=400.0;
xlabel='Orbital Distance (AU)';
ylabel='Temperature (Kelvin)';
updateModel();

// Reset application
document.getElementById('reset').addEventListener('click',function(event) {

    data=null;
    range=null;
    model=null;
    point=null;
    annos=null;

    document.getElementById('xlogplot').checked = false;
    document.getElementById('ylogplot').checked = false;
	modformula.innerHTML= '<p> y = x </p>';

	xmin=0.;
	xmax=20.0;
	ymin=0.;
	ymax=400.0;

	xlabel='Orbital Distance (AU)';
	ylabel='Temperature (Kelvin)';

	teqbutton.checked=true;
	modchange()
});

//Adjust axis manually and then plot in real time
document.getElementById('axiscontrols').addEventListener('input', function(event) {

	xmin=Number(document.getElementById('xmin').value);
	ymin=Number(document.getElementById('ymin').value);
	xmax=Number(document.getElementById('xmax').value);
	ymax=Number(document.getElementById('ymax').value);  

	updateModel();
});

function modchange() {

	let formula;

	if (teqbutton.checked){
		formula='<p> T<sub>eq</sub> = [ (1 − A)·L / (16πσ d²) ]<sup>1/4</sup> </p>';
	} else if (teffbutton.checked){
		formula='<p> T<sub>eff</sub> = T<sub>eq</sub> x [1+3·0.5841·gh/4]<sup>1/4</sup> </p>';
	} else {
		formula='<p> T<sub>surf</sub> = T<sub>eff</sub>/0.9 </p>';
	}

	modformula.innerHTML = formula;

	if (teqbutton.checked){
		document.getElementById('Ggas').disabled = true;
		document.getElementById('Ggas_slider').disabled = true;
	} else {
		document.getElementById('Ggas').disabled = false;
		document.getElementById('Ggas_slider').disabled = false;
	}
		
	updateModel();

};

teqbutton.addEventListener('change', function () {
		modchange();   // defaults to includeModel = true
	});

teffbutton.addEventListener('change', function () {
		modchange();   // defaults to includeModel = true
	});

tsurfbutton.addEventListener('change', function () {
		modchange();   // defaults to includeModel = true
	});

document.getElementById('modelParams').addEventListener('input',updateModel);

document.getElementById('modelType').addEventListener('input',updateModel);

//Autoscale button
document.getElementById('autoscale').addEventListener('click', function () {
		autoscale();
		updateModel();
	});

function habitable_zone(x,y){
    let hzmin=null;
    let hzmax=null;

    for(let i=0;i<x.length;i++){
      if(y[i]>=273.15 && y[i]<=373.15){
        if(hzmin===null) hzmin=x[i];
        hzmax=x[i];
      }
    }

    return [hzmin,hzmax]
}

function linkSlider(sliderId, numberId) {

    const slider = document.getElementById(sliderId);
    const number = document.getElementById(numberId);

    // Slider → Number
    slider.addEventListener('input', () => {
        number.value = slider.value;
    });

    // Number → Slider
    number.addEventListener('input', () => {
        slider.value = number.value;
    });
}

linkSlider('Lstar_slider', 'Lstar');
linkSlider('Albedo_slider', 'Albedo');
linkSlider('Ggas_slider', 'Ggas');
linkSlider('Semi_slider', 'Semi');

