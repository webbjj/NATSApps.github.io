// Get elements from document
const modformula=document.getElementById('modelFormula');
//const nmod = document.getElementById('nmod');
const mjupiter_to_msolar=0.000954588;
const rjupiter_to_rsolar=0.102763;
const auyr_to_ms=4743.72;
const au_to_rsolar=215.032;


//Calculate model data and then makePlot
function updateModel() {

	var Mstar=Number(document.getElementById('Mstar').value);
	var Rstar=Number(document.getElementById('Rstar').value);
	var Rplanet=Number(document.getElementById('Rplanet').value)*rjupiter_to_rsolar;
	var Tplanet=Number(document.getElementById('Tplanet').value);
	var Semi=period_to_semi(Tplanet/365.0,Mstar,0.0);
	var Offset=Number(document.getElementById('Offset').value);


	document.getElementById('Offset').setAttribute("max",document.getElementById('Tplanet').value);
	document.getElementById('Offset_slider').setAttribute("max",document.getElementById('Tplanet').value);

	//Make sure at least 2 points per transit:
	let Vplanet=vplanet(Mstar,Semi)*au_to_rsolar/365.0;
	let Twidth=2.0*Rstar/Vplanet;
	let dt=Twidth/5.;

	//var N = Number(nmod.value);
	
	let xmod=[];
	let ymod=[];

	const xminNum=Math.max(Number(xmin),0.0);
	const xmaxNum=Number(xmax);
	var dx=xmaxNum-xminNum;

	var N=Math.max(1000,Math.ceil(dx/dt));

	console.log(dt,dx,N);

	for (let i = 0; i < N; i++) {
		xmod[i]=xminNum+i*dx/(N-1);
	}


	ymod=transit(xmod,Rstar,Rplanet,Tplanet,Vplanet,Offset);

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
xmax=50.0;
ymin=0.98;
ymax=1.02;
xlabel='Time (Days)';
ylabel='Normalized Brightness';updateModel();

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
	xmax=50.0;
	ymin=0.98;
	ymax=1.02;

	xlabel='Time (Days)';
	ylabel='NOrmalized Brightness';

	document.getElementById('Mstar').value=1.0;
	document.getElementById('Rstar').value=1.0;
	document.getElementById('Rplanet').value=1.0;
	document.getElementById('Tplanet').value=10.0;
	document.getElementById('Offset').value=0.0;
	document.getElementById('Offset_slider').setAttribute("max",document.getElementById('Tplanet').value);
	document.getElementById('Offset').setAttribute("max",document.getElementById('Tplanet').value);

	document.getElementById('Semi').value=0.09;

	autoscale(false,0,50,0.98,1.02);

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
		autoscale(true,-1,1,-1,1,ybuff=0.001);
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
linkSlider('Rstar_slider', 'Rstar');
linkSlider('Rplanet_slider', 'Rplanet');
linkSlider('Tplanet_slider', 'Tplanet');
linkSlider('Offset_slider', 'Offset');

//Recalculate Semi and UpdateModel when input changes
document.getElementById('modelParams').addEventListener('input', function () {

	var Mstar=Number(document.getElementById('Mstar').value);
	var Rstar=Number(document.getElementById('Rstar').value);

	var Rplanet=Number(document.getElementById('Rplanet').value)*rjupiter_to_rsolar;;
	var Tplanet=Number(document.getElementById('Tplanet').value)/365.0;
	var Semi=period_to_semi(Tplanet,Mstar,0.0);

	document.getElementById('Semi').value=Semi;

	document.getElementById('Offset_slider').setAttribute("max",document.getElementById('Tplanet').value);
	document.getElementById('Offset').setAttribute("max",document.getElementById('Tplanet').value);

	updateModel()
});
