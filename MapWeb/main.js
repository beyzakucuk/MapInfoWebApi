//map
var vectorLayer, vectorSource,x,y,item;
var check=0;
vectorSource= new ol.source.Vector;
vectorLayer= new ol.layer.Vector({source:vectorSource});
var map = new ol.Map({
    target: 'map',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      }),
    vectorLayer,

    ],
    view: new ol.View({
      center: ol.proj.fromLonLat([ 32.85427,39.91987]),
      zoom: 10
    })
  });
  const badNot=(message)=>{Swal.fire({
    icon: 'error',
    title: 'Oops...',
    text: message,
  })}
  const goodNot=(message)=>{Swal.fire({
   icon: 'success',
   title: 'Başarılı :)',
   text: message,
  
   })}
//get all features
const getAllFeatures=()=> {
  const iconStyle = new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.5, 0.9],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      src: 'location.png',
      scale: [0.05,0.05],
    }),
  });
  vectorSource.clear();
  fetch('https://localhost:7268/api/Location/', {
      method: 'get',
      headers:{
       "Content-Type": "application/json"
     }
    }).then(response=>{
     return response.json();
    }).then(data=>{
       for (let i = 0; i < data.list.length; i++) {
      let feature = new ol.Feature({
          id: data.list[i].id,
          geometry: new ol.geom.Point([data.list[i].x , data.list[i].y]),
          name: data.list[i].name,
          population: 4000,
          rainfall: 500
        });
        feature.setStyle(iconStyle);
         vectorSource.addFeature(feature);
     
      }
      });
}
//Points on map first time
  window.onload = (event) => {
    
      getAllFeatures();
  };
  //Delete Loc
const deleteLoc=(id)=> {

  fetch('https://localhost:7268/api/Location/' + id, {
    method: 'DELETE'
  }).then(response=>{
    return response.json();
   }).then(data=>{
    console.log(data);
    if(data.status==true)
   {
    goodNot(data.message);
    getAllList();

   }
   else
   badNot(data.message);
  }).catch(error => console.log(error));
}
$(document).on('keydown', function(e) {
  draw.setActive(false);
  modify.setActive(false);
  select.setActive(false);
});
//put loc
var select = new ol.interaction.Select();
    map.addInteraction(select);
    select.setActive(false);
    var vectorSource2= new ol.source.Vector;
    var modify = new ol.interaction.Modify({source: vectorSource2});
    map.addInteraction(modify);
    modify.setActive(false);
  
    const updateXY=(id,bool)=> {
      item={
        id:id,
        name:document.getElementById(id).value,
        x:0,
        y:0
      }
      
      if(bool==1)
    document.getElementById("panel2").close();

    vectorSource.getFeatures().forEach(function (feature) {
      if(id==feature.getProperties().id)
       {
        const extent = feature.getGeometry().getExtent();
        map.getView().fit(extent);
        vectorSource2.addFeature(feature);
       vectorSource.removeFeature(feature);
       }  })
    select.setActive(true);
    modify.setActive(true);
    document.getElementById("take-co").style.display = 'block';
    }
    modify.on("modifyend",(event)=>{
      event.features.forEach(function(feature) {
      var coordinate=feature.getGeometry().getCoordinates();
        item.x= coordinate[0];
        item.y= coordinate[1];
      })});

    var takeloc=document.getElementById("take-co");
    takeloc.addEventListener("click", function () {
      select.setActive(false);
      modify.setActive(false);
      updateLoc(item);
      });
    
    
        const updateLoc=(item)=> {
  
          fetch('https://localhost:7268/api/Location?', {
            method: 'put',
            headers: {
              'Accept': 'application/json',
              "Content-Type": "application/json"
            },
            body: JSON.stringify(item)
          }).then(response=>{
            return response.json();
           }).then(data=>{
        
            if(data.status==true)
          {goodNot(data.message);
           getAllFeatures();
           map.getView().animate({zoom: 10});           ;
          }
           else
           badNot(data.message);
            console.log(data);
            
          }).catch(error => console.log(error));
     
        }
//popup
var element = document.getElementById('popup');
var popup = new ol.Overlay({
  element: element,
  positioning: 'bottom-center',
  stopEvent: true,
  offset: [0, -10],
});
map.addOverlay(popup);
  map.on('singleclick', function (event) {
   if(check==0)
   {
    $('#popup').popover('dispose');
    var feature = map.getFeaturesAtPixel(event.pixel);
    if (feature) {
    var vectorSource3=new ol.source.Vector; 
    vectorSource3.addFeatures(feature);
      if(vectorSource3.getFeatures().length==1)
      {
      feature = map.getFeaturesAtPixel(event.pixel)[0];
      const coordinate = feature.getGeometry().getCoordinates();
      popup.setPosition([
        coordinate[0] ,
        coordinate[1]
      ]);
      $('#popup').popover({
        container: element.parentElement,
        html: true,
        sanitize: false,
        content: `
        <table>
          <tbody>
            <tr><th>İsim:</th><td><input id="${feature.getProperties().id}" data-post-id="${feature.getProperties().id}" name="popin" value='${feature.getProperties().name}'/></td></tr>
            <tr><th>lon:</th><td>${coordinate[0]}</td></tr>
            <tr><th>lat:</th><td>${coordinate[1]}</td></tr> 
          </tbody>
          </table>
            <button name="popup-delete" id="delete" data-post-id="${feature.getProperties().id}">Delete</button>
            <button name="popup-update" id="update"data-post-id="${feature.getProperties().id}">Update</button>`,
        placement: 'top',
      });
      
      $('#popup').popover('show');
      $('div.popover .popover-body [name="popup-delete"]').off().on('click', function () {
        var featureID = $(this).data('post-id');

        deleteLoc(featureID);
        getAllFeatures();

      });
      $('div.popover .popover-body [name="popup-update"]').off().on('click', function () {
        var featureID = $(this).data('post-id');
        updateXY(featureID,0);
        getAllFeatures();
      });
    }
     else if(vectorSource3.getFeatures().length>1)
    {
      createPanel(0);
      var table = document.getElementById("body");
      let i=0
      vectorSource3.getFeatures().forEach(function (feature) {
        var row = table.insertRow(i);

        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        var cell5 = row.insertCell(4);
        var cell6 = row.insertCell(5);


        cell1.innerHTML = feature.getProperties().id;
        cell2.innerHTML = feature.getProperties().name;
        cell3.innerHTML = feature.getGeometry().getCoordinates()[0];
        cell4.innerHTML = feature.getGeometry().getCoordinates()[1];
        cell5.innerHTML = '<button onclick="deleteLoc('+feature.getProperties().id+')">Delete</button>';
        cell6.innerHTML = '<button onclick="updateXY('+feature.getProperties().id+',1)" >Delete</button>';

        
         i++;
        })
    }
      }
      
    }
  });
  map.on('pointermove', function (event) {
    if (map.hasFeatureAtPixel(event.pixel)) {
     map.getViewport().style.cursor = 'pointer';
  } else {
     map.getViewport().style.cursor = 'inherit';
   }
});
//Add Loc  
const draw = new ol.interaction.Draw({
  type:"Point",
  source: vectorSource
});
draw.setActive(false);
map.addInteraction(draw);
draw.on("drawend",(event)=>{
  check=1;
  var coordinate=event.feature.getGeometry().getCoordinates();
  x= coordinate[0];
  y= coordinate[1];
  
  jsPanel.create({
    id:"panel",
    content:
    '<p>Lütfen eklemek istediğiniz konum ismini giriniz:</p>' +
    '<input id="name"class="javascript: ;" type="text" name="name" />'+
    '<button onclick="createLocation(document.querySelector(\'#name\').value)">Ekle</button>',
    theme: 'dark',
    headerLogo: '<i class="fad fa-home-heart ml-2"></i>',
    headerTitle: 'Konum Ekle',
    footerToolbar:'<i class="fal fa-clock mr-2"></i><span class="clock">loading ...</span>',
    panelSize: {
        width: () => { return Math.min(300, window.innerWidth*0.9);},
        height: () => { return Math.min(200, window.innerHeight*0.6);}
    },
    onwindowresize: true,
    callback: function(panel) {
        function clock() {
            let time = new Date(),
                hours = time.getHours(),
                minutes = time.getMinutes(),
                seconds = time.getSeconds();
            panel.footer.querySelectorAll('.clock')[0].innerHTML = `${harold(hours)}:${harold(minutes)}:${harold(seconds)}`;
            function harold(standIn) {
                if (standIn < 10) {standIn = '0' + standIn;}
                return standIn;
            }
        }
        setInterval(clock, 1000);
    }
  });
  draw.setActive(false);
  
 })
const createLocation=(name)=>{
 var location={
   name,
   x,
   y
 };
 fetch('https://localhost:7268/api/Location', {
   method: "post",
   headers: {
     "Content-Type": "application/json"
   },
   body: JSON.stringify(location)
  })
   .then(response => response.json())
   .then(data=>{
    console.log(data);
    if(data.status==true)
    {
      goodNot(data.message);
      getAllFeatures();
      check=0;

    }
   else
   badNot(data.message);

   document.getElementById("name").value="";
  })
   .catch(error => console.log(error));


}

//get all location list
function getAllList(){
  $('#list').DataTable().clear().destroy();
  fetch('https://localhost:7268/api/Location')
  .then((response) => response.json())
  .then((data) =>{ 
  $("#list").DataTable({
    destroy:true,
    autoWidth: false,
    responsive:true,
    data: data.list,
    searching: false, 
    paging: false,
    info: false,
    columns: [
        { data: "id" },
        {data:data,
          render: function (data) {
            return '<input id="'+data.id+'" value=\''+data.name+'\'/>'
          } },
        { data: "x" },
        { data: "y" },    
        {data:"id",
          render: function (data) {
            return '<button onclick="deleteLoc('+data+')">Delete</button>'
          } },
          {data:"id",
          render: function (data) {
            return '<button onclick="updateXY('+data+',1)">Update</button>'
          } }
        ]
    
  })
  if(data.status==true)
   goodNot(data.message);
   else
   badNot(data.message);
   getAllFeatures();
})

$('#list').DataTable().columns.adjust().responsive;
}
function createPanel(check)
{
  if(check==1)
  getAllList();
  
    jsPanel.create({
    id:"panel2",
    content:`	<table id ="list"  name="list" class="table"><thead class="thead-dark"> <tr> <th scope="col">id</th>  <th scope="col">Name</th> <th scope="col">X</th><th scope="col">Y</th><th scope="col">Delete</th><th scope="col">Update</th>  </tr> </thead><tbody id = "body"></tbody></table> `,
    theme: 'dark',
    headerLogo: '<i class="fad fa-home-heart ml-2"></i>',
    headerTitle: 'Konumlar',
    footerToolbar:'<i class="fal fa-clock mr-2"></i><span class="clock">loading ...</span>',
    panelSize: {
        width: () => { return Math.min(900, window.innerWidth*0.9);},
        height: () => { return Math.min(500, window.innerHeight*0.6);}
    },
    onwindowresize: true,
    callback: function(panel) {
        function clock() {
            let time = new Date(),
                hours = time.getHours(),
                minutes = time.getMinutes(),
                seconds = time.getSeconds();
            panel.footer.querySelectorAll('.clock')[0].innerHTML = `${harold(hours)}:${harold(minutes)}:${harold(seconds)}`;
            function harold(standIn) {
                if (standIn < 10) {standIn = '0' + standIn;}
                return standIn;
            }
        }
        setInterval(clock, 1000);
    }
  });
}
  
//Get Loc By ID
const getLocationById=(id)=> {
  fetch('https://localhost:7268/api/Location/' + id, {
    method: 'get'
  }).then(response=>{
    return response.json();
   }).then(data=>{
    if(data.status==true)
    {
    document.getElementById('lname').value=data.location.name;
    document.getElementById('x').value=data.location.x;
    document.getElementById('y').value=data.location.y;
   goodNot(data.message);
    }
   else
   badNot(data.message);
  }).catch(error => console.log(error));
}
const getByIdLoc = document.getElementById("getById-loc");
getByIdLoc.addEventListener("click",()=>{
  jsPanel.create({ 
    id:"panel3",
    content:
    '<p>Lütfen görüntülemek istediğiniz konum id\'sini giriniz.</p>' +
    '<input id="id"class="javascript: ;" type="text" name="id" /><br>'+
    '<button onclick="getLocationById(document.querySelector(\'#id\').value)">Göster</button><br>'+
    '<label for="lname"> İsim: </label>'+
    '<input class="form-control" type="text" id="lname" name="lname" disabled readonly><br>'+
    '<label for="x"> X: </label>'+
    '<input class="form-control" type="text" id="x" name="x" disabled readonly><br>'+
    '<label for="y"> Y: </label>'+
    '<input  class="form-control"type="text" id="y" name="y" disabled readonly><br>',
    theme: 'dark',
    headerLogo: '<i class="fad fa-home-heart ml-2"></i>',
    headerTitle: 'Konum Göster',
    panelSize: {
        width: () => { return Math.min(300, window.innerWidth*0.9);},
        height: () => { return Math.min(500, window.innerHeight*0.6);}
    },
    onwindowresize: true
  });
})
