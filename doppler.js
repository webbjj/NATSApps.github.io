// Get elements from document
const modformula=document.getElementById('modelFormula');
//const nmod = document.getElementById('nmod');
const mjupiter_to_msolar=0.000954588;
const auyr_to_ms=4743.72;

//Calculate model data and then makePlot
function updateModel() {

	var Mstar=Number(document.getElementById('Mstar').value);
	var Mplanet=Number(document.getElementById('Mplanet').value);
	var Tplanet=Number(document.getElementById('Tplanet').value);
	var Semi=Number(document.getElementById('Semi').value);
	var Inc=Number(document.getElementById('Inc').value);
	var Offset=Number(document.getElementById('Offset').value);

	let xmod=[];
	let ymod=[];

	const xminNum=Math.max(Number(xmin),0.0);
	const xmaxNum=Number(xmax);
	var dx=xmaxNum-xminNum;

	var N=1000;

	if (dx > Tplanet){
		N=Math.ceil(Tplanet/dx)*1000;
	}


	for (let i = 0; i < N; i++) {
		xmod[i]=xminNum+i*dx/(N-1);
	}

	
	let vpl=vplanet(Mstar,Semi)*auyr_to_ms;
	let vst=vpl*Mplanet*mjupiter_to_msolar/Mstar;
	let A=vst*Math.sin(Inc*Math.PI/180.0);
	let B=(2.0*Math.PI)/Tplanet;
	let C=Offset*2.0*Math.PI;

	ymod=sinusoidal(xmod,A,B,C,0.);

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
	    name: 'Model',
	    line: {color:'orange', width:2},
	    marker: {color:'orange'}
	};

	makePlot()

}

xmin=0.;
xmax=400.0;
ymin=-50;
ymax=50;
xlabel='Time (Days)';
ylabel='Radial Velocity (m/s)';updateModel();

// Reset application
document.getElementById('reset').addEventListener('click',function(event) {

    data=null;
    range=null;
    model=null;
    point=null;
    annos=null;

    if (loader){
		document.getElementById('fileInput').value = '';
	}

    document.getElementById('xlogplot').checked = false;
    document.getElementById('ylogplot').checked = false;
    document.getElementById('showmod').checked = true;
    //document.getElementById('nmod').value = 1000;

	xmin=0.;
	xmax=400.0;
	ymin=-50;
	ymax=50.0;

	xlabel='Time (Days)';
	ylabel='Radial Velocity (m/s)';

	document.getElementById('Mstar').value=1.0;
	document.getElementById('Mplanet').value=1.0;
	document.getElementById('Tplanet').value=365.0;
	document.getElementById('Inc').value=90;
	document.getElementById('Offset').value=0.0;
	document.getElementById('Semi').value=1.0;

	autoscale(false,0,400,-50,50);

	updateModel()
});

//Adjust axis manually and then plot in real time
document.getElementById('axiscontrols').addEventListener('input', function(event) {

	xmin=Number(document.getElementById('xmin').value);
	ymin=Number(document.getElementById('ymin').value);
	xmax=Number(document.getElementById('xmax').value);
	ymax=Number(document.getElementById('ymax').value);  

	updateModel();
});

//document.getElementById('modelParams').addEventListener('input',updateModel);

//nmod.addEventListener('change', updateModel);

//Autoscale button
document.getElementById('autoscale').addEventListener('click', function () {
		autoscale();
		updateModel();
});

document.getElementById('showmod').addEventListener('change', updateModel);


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

linkSlider('Mstar_slider', 'Mstar');
linkSlider('Mplanet_slider', 'Mplanet');
linkSlider('Tplanet_slider', 'Tplanet');
linkSlider('Inc_slider', 'Inc');
linkSlider('Offset_slider', 'Offset');

//Recalculate Semi and UpdateModel when input changes
document.getElementById('modelParams').addEventListener('input', function () {

	var Mstar=Number(document.getElementById('Mstar').value);
	var Mplanet=Number(document.getElementById('Mplanet').value)*mjupiter_to_msolar;
	var Tplanet=Number(document.getElementById('Tplanet').value)/365.0;
	var Semi=period_to_semi(Tplanet,Mstar,Mplanet);

	document.getElementById('Semi').value=Semi;

	updateModel()
});
