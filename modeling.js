// Get elements from document
const modformula=document.getElementById('modelFormula');
const modtype=document.getElementById('modelType');
const nmod = document.getElementById('nmod');


//Calculate model data and then makePlot
function updateModel() {

	// Calculate model if set and show is selected
	if (modtype != null && document.getElementById('showmod').checked){

		if (modtype.value != 'none'){
			var A=Number(document.getElementById('modA').value);
			var B=Number(document.getElementById('modB').value);
			var C=Number(document.getElementById('modC').value);
			var D=Number(document.getElementById('modD').value);

			let N = Number(nmod.value);
			let xmod=[];
			let ymod=[];

			const xminNum=Number(xmin);
			const xmaxNum=Number(xmax);
			const dx=xmaxNum-xminNum;

			for (let i = 0; i < N; i++) {
				xmod[i]=xminNum+i*dx/(N-1);
			}

			switch(modtype.value) {
				case 'linear':
					ymod=linear(xmod,A,B);
					break;
				case 'powerlaw':
					ymod=powerlaw(xmod,A,B);
					break;
				case 'exponential':
					ymod=exponential(xmod,A,B);
					break;
				case 'sinusoidal':
					ymod=sinusoidal(xmod,A,B,C,D);
					break;
				case 'gaussian':
					ymod=gaussian(xmod,A,B,C);
					break;
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
			    mode: 'lines+markers',
			    name: 'Model',
			    line: {color:'orange', dash:'dash', width:2},
			    marker: {color:'orange'}
			};

		}

	} else {
		model=null;
	}

	makePlot()

}

updateModel()


if (modtype!=null){

	document.getElementById('showmod').addEventListener('change', updateModel);

	// Reset application
	document.getElementById('reset').addEventListener('click',function(event) {
		// Clear x and y
	    xlabel='X';
	    ylabel='Y';

	    data=null
	    model=null


		document.getElementById('fileInput').value = '';
	    document.getElementById('xlogplot').checked = false;
	    document.getElementById('ylogplot').checked = false;


		document.getElementById('showmod').checked = false;
		nmod.disabled = true;
		nmod.value = 10;
		document.getElementById('modA').disabled = true;
		document.getElementById('modB').disabled = true;
		document.getElementById('modC').disabled = true;
		document.getElementById('modD').disabled = true;
		document.getElementById('modA_slider').disabled = true;
		document.getElementById('modB_slider').disabled = true;
		document.getElementById('modC_slider').disabled = true;
		document.getElementById('modD_slider').disabled = true;
		modtype.value='none';
		modformula.textContent= '---------------';

		autoscale();

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
	

	modtype.addEventListener('change', function(event) {

		let modA=document.getElementById('modA')
		let modB=document.getElementById('modB')
		let modC=document.getElementById('modC')
		let modD=document.getElementById('modD')

		let formula;

		switch(modtype.value) {
			case 'linear':
				formula='<p> y = A x + B </p>';
				break;
			case 'powerlaw':
				formula='<p> y = A x <sup>B</sup> </p>';
				 break;
			case 'exponential':
				formula='<p> y = A e <sup>B x</sup> </p>';
				break;
			case 'sinusoidal':
				formula='<p> y = A sin (B x + C) + D </p>';
				break;
			case 'gaussian':
				formula='<p> y = A e <sup>(- (x-B)<sup>2</sup> / 2C<sup>2</sup>) </sup> </p>';
				break;
			case 'none':
				formula='';
				break;
			case 'default':
				formula='None';
				break;
		}

		modformula.innerHTML = formula;

		if (modtype.value == "none") {
			model=null;
			nmod.disabled = true;

			modA.disabled = true;
			modB.disabled = true;
			modC.disabled = true;
			modD.disabled = true;

			document.getElementById('modA_slider').disabled = true;
			document.getElementById('modB_slider').disabled = true;
			document.getElementById('modC_slider').disabled = true;
			document.getElementById('modD_slider').disabled = true;

		} else if (modtype.value != 'none'){


			document.getElementById('showmod').checked = true;
			nmod.disabled = false;

			modA.disabled = false;
			modA.value = 1.0;

			modB.disabled = false;
			modB.value = 1.0;

			document.getElementById('modA_slider').disabled = false;
			document.getElementById('modB_slider').disabled = false;

			if (modtype.value == 'gaussian') {
	    		modC.disabled = false;
	    		document.getElementById('modC_slider').disabled = false;
	    		modA.value=1.0
	    		modB.value=0.0
	    		modC.value=1.0;
			} else if (modtype.value == 'sinusoidal') {
	    		modC.disabled = false;
	    		modD.disabled = false;
				document.getElementById('modC_slider').disabled = false;
				document.getElementById('modD_slider').disabled = false;
	    		modC.value=0.;
				modD.value=0.;
			} else {
				modC.disabled=true;
				modC.value=0.;
				modD.disabled=true;
				modD.value=0.;
				document.getElementById('modC_slider').disabled = true;
				document.getElementById('modD_slider').disabled = true;
			}
			
		}
		
		updateModel();

	});

	nmod.addEventListener('change', updateModel);

	document.getElementById('modelParams').addEventListener('input',updateModel);
}

function linkSlider(sliderId, numberId) {

    const slider = document.getElementById(sliderId);
    const number = document.getElementById(numberId);

    // Slider → Number
    slider.addEventListener('input', () => {
        number.value = slider.value;
        updateModel();
    });

    // Number → Slider
    number.addEventListener('input', () => {
        slider.value = number.value;
        updateModel();
    });
}

linkSlider('modA_slider', 'modA');
linkSlider('modB_slider', 'modB');
linkSlider('modC_slider', 'modC');
linkSlider('modD_slider', 'modD');