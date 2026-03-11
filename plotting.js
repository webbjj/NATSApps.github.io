// Get elements from document
const plot=document.getElementById('plot');
const loader=document.getElementById('fileLoad');
const ismodel = document.getElementById('modelType');

//Initialize elements for plotting
var data = null;
var model = null;
var range = null;
var point = null;
var annos = [];

var xlabel='X';
var ylabel='Y';
var xmin=-1;
var xmax=1;
var ymin=-1;
var ymax=1;


//function for making plot
function makePlot(){


	// Set lower and upper limits of plot, as well as axis type
	let xlower, xupper;
	let ylower, yupper;
	let xtype, ytype;

	// Data to be plotted
	let outData = [];

	//Check if any axis should be log and adjust limits
	if (document.getElementById('xlogplot').checked) {
		xtype='log';
		xlower=Math.log10(xmin);
		xupper=Math.log10(xmax);
	} else {
		xtype='linear';
		xlower=xmin;
		xupper=xmax;
	}

	if (document.getElementById('ylogplot').checked) {
		ytype='log';
		ylower=Math.log10(ymin);
		yupper=Math.log10(ymax);
	} else {
		ytype='linear';
		ylower=ymin;
		yupper=ymax;
	}

	//Populate the array for plotting
	if (data != null) {
		outData.push(data);
	}

	if (model != null && document.getElementById('showmod').checked) {
		outData.push(model);
	}

	if (range != null) {
		outData.push(range);
	}

	if (point != null) {
		outData.push(point);
	}

	//Plot via Plotly
	Plotly.react(plot,outData,{
			xaxis:{title:xlabel,range:[xlower,xupper], type:xtype},
			yaxis:{title:ylabel,range:[ylower,yupper], type:ytype},
			paper_bgcolor:'transparent',
			plot_bgcolor:'transparent',
			font:{color:'white'},
			annotations:annos,

	},{responsive:true});

}

// Scale x and y axis to show data and model
function autoscale(includeModel = true, xmin0=-1, xmax0=1,ymin0=-1,ymax0=1,ybuff=0.0) {

	if (data == null && model == null) {
		xmin=xmin0;
		xmax=xmax0;
		ymin=ymin0;
		ymax=ymax0;
	} else {
	    xmin =  Infinity;
	    xmax = -Infinity;
	    ymin =  Infinity;
	    ymax = -Infinity;
	}

	if (model != null && includeModel){

		xmin = Math.min(xmin,Math.min(...model.x));
		xmax = Math.max(xmax,Math.max(...model.x));
		ymin = Math.min(ymin,Math.min(...model.y));
		ymax = Math.max(ymax,Math.max(...model.y));
		

	}

	if (data != null) {
   		xmin = Math.min(xmin, Math.min(...data.x));
   		xmax = Math.max(xmax, Math.max(...data.x));

   		ymin = Math.min(ymin, Math.min(...data.y));
   		ymax = Math.max(ymax, Math.max(...data.y));
	}

	//Add a buffer for transit method. Treated as a percent
	if (ybuff!=0.0){
		ymin = ymin*(1.0-ybuff);
		ymax = ymax*(1.0+ybuff);
	}

	document.getElementById('xmin').value=String(xmin);
	document.getElementById('xmax').value=String(xmax);
	document.getElementById('ymin').value=String(ymin);
	document.getElementById('ymax').value=String(ymax);

	makePlot();
};

if (ismodel==null) {

	makePlot(); // initialize on load

	//Add Plotting Listeners

	// Reset application
	document.getElementById('reset').addEventListener('click',function(event) {
		// Clear x and y

	    xlabel='X';
	    ylabel='Y';

	    data=null;
	    model=null;

	    if (loader){
			document.getElementById('fileInput').value = '';
		}
	    document.getElementById('xlogplot').checked = false;
	    document.getElementById('ylogplot').checked = false;
		autoscale();

	});


	//Adjust axis manually and then plot in real time
	document.getElementById('axiscontrols').addEventListener('input', function(event) {

		xmin=Number(document.getElementById('xmin').value);
		ymin=Number(document.getElementById('ymin').value);
		xmax=Number(document.getElementById('xmax').value);
		ymax=Number(document.getElementById('ymax').value);  

		makePlot();
	});

	//Autoscale button
	document.getElementById('autoscale').addEventListener('click', function () {
		autoscale();   // defaults to includeModel = true
	});

}

//Change axis type and whether model is being shown
document.getElementById('xlogplot').addEventListener('change', makePlot);
document.getElementById('ylogplot').addEventListener('change', makePlot);

if (loader!=null){

	//Load CSV File
	//If fileLoad button is pressed, trigger a click on fileInput
	loader.addEventListener('click',()=>document.getElementById('fileInput').click());

	//If fileInput triggered, load dataset
	//If model already loaded, recalculate axis for range of CSV Data
	document.getElementById('fileInput').addEventListener('change', function(event) {

		// Clear x and y
	    let xdata=[];
	    let ydata=[];
	    xlabel='X'
	    ylabel='Y'

	    const file = event.target.files[0];

	    let iheader=0;

	    if (file) {
	        const reader = new FileReader();

	        reader.onload = function(e) {
	            const content = e.target.result;

	            //split into rows
	            const rows = content.split(/\r?\n/);

				for (let i = 0; i < rows.length; i++) {

					const row = rows[i].trim();

					if (row === '') continue; // skip empty lines

					    const columns = row.split(',');

					    if (i==0 && isNaN(columns[0])) {
					    	xlabel=columns[0];
					    	ylabel=columns[1];
					    	iheader=1;

					    } else {

						    xdata[i-iheader]=Number(columns[0]);
						    ydata[i-iheader]=Number(columns[1]);
						}

	        	};

				data = { x:xdata, y:ydata, type:'scatter', mode:'lines+markers', name:'Data', line:{color:'#4DA3FF', width:2}, marker:{color:'#4DA3FF'}};

				autoscale(includeModel = false);

	    	}

	        reader.readAsText(file);

		}


	});
}
