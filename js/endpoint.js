var endpoint;
var endpoints = [
    "http://seagull.isi.edu:3030/ds/", 
    "http://disk.isi.edu:3030/ds/"
]
var exampleworkflowURI = [];
var workflowURI;


function testEndpoint(uri, handler)  {
    var sparql = 'ASK WHERE { ?s ?p ?o . }';
    var endpointURI = uri + 'query?query=' + escape(sparql) + '&format=json';
    $.ajax({
        url: endpointURI,
        type: 'GET',
        cache: false,
        timeout: 3000,
        error: function(){
            handler({});
        },
        success: function(res) {
            handler(res);
        }
    });
}

function endpointonclick(event)  {
    var me = event.target;
    localStorage.setItem("endpoint", me.innerHTML);
    testEndpoint(me.innerHTML, handleErrorEndpoint);
    location.reload(true);
}

function handleErrorEndpoint(res)  {
    if(res==null)  {
        $("#chosenendpoint").append("<br><font color=#FF0000>Endpoint Down! Choose Another!</font>");
    }
    else if(res.hasOwnProperty('boolean'))  {
        if(res.boolean == true) {
            return;
        }
        else {
            $("#chosenendpoint").append("<br><font color=#FF0000>Endpoint Down! Choose Another!</font>");
        }
    }
    else {
        $("#chosenendpoint").append("<br><font color=#FF0000>Endpoint Down! Choose Another!</font>");
    }
}

function readEndpoint() {
    /*    $.get(file, function(data) {    
    endpoints = data.split(/\r?\n/);    */
    for(var i=0;i<endpoints.length;++i)
    {
        var a = '<a href="#" class="endpointurl" onclick="endpointonclick.call(this,event)">' + endpoints[i] + '</a>';
        document.getElementById("dropdown-content").innerHTML += a;        
    }
    if(localStorage.getItem("endpoint")!=null) endpoint = localStorage.getItem("endpoint");
    else {
        endpoint = endpoints[0];
        localStorage.setItem("endpoint", endpoint);
    }
    document.getElementById("chosenendpoint").innerHTML += localStorage.getItem("endpoint");
    testEndpoint(endpoint, handleErrorEndpoint);
}

function getExecutionNumber(workflowURI, currentelement) {
    var sparql = 'select ?execution from <urn:x-arq:UnionGraph> where { ?execution <http://www.opmw.org/ontology/correspondsToTemplate> <' + workflowURI + '>}';
    var endpointURI = endpoint + "query?query=" + escape(sparql) + "&format=json";
    $.ajax({
        url: endpointURI,
        type: 'GET',
        cache: false,
        timeout: 30000,
        error: function(){
        },
        success: function(res) {
            if(res.results.bindings.length==1)  {
                currentelement.append("1 execution");
            }
            else {
                currentelement.append(res.results.bindings.length+" executions");
            }
        }
    });
}

function getRamdomWorkflow()  {
    populateSearchBar(function(res) { 
        //executes after ajax call returns
        workflowSuggestions = parseAutocomplete(res);
        const shuffled = workflowSuggestions.sort(() => .5 - Math.random());// shuffle
        if(shuffled.length >= 7) {
            var selected =shuffled.slice(0,7); //get sub-array of first n elements AFTER shuffle
        }
        else {
            var selected =shuffled.slice(0,shuffled.length);
        }
        for(var i=0;i<4;++i) {
            var currentexample = $($(".workflowexample")[i]);
            currentexample.find("figcaption").html(selected[i].label + "<br>");
            getExecutionNumber(selected[i].uri, currentexample.find("figcaption"));
            exampleworkflowURI.push(selected[i].uri);
            var encryptedURI = CryptoJS.AES.encrypt(selected[i].uri, "csci401-Spring-2017");                
            currentexample.find(".overlay").attr("href", 'workflow-main.html?uri='+encryptedURI);
        }
        localStorage.setItem("exampleworkflowURI", exampleworkflowURI);
        workflowURI = exampleworkflowURI[0];
        getWorkflowData(workflowURI, function(res) {
            renderVisualization(res, false);
        });
    });
}

readEndpoint();
getRamdomWorkflow();
