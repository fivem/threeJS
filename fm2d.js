 /*
 * GHAO
 * forever113@126.com
 * 2017-01-10
 */
//import css
var link = document.createElement("link");
link.href = "toolbar/css/jquery.toolbar.css";
link.rel = 'stylesheet';
link.async = link.defer = false;
document.head.appendChild(link);
 
/************import js library **************/
//脚本的async和defer全为false的时候。页面停止解析。立即下载并执行脚本。
var script_three = document.createElement("script");
script_three.src = 'three/three.js';
script_three.async = false;
document.body.appendChild(script_three);

var script_control = document.createElement("script");
script_control.src = 'three/OrbitControls.js';
script_control.async = false;
document.body.appendChild(script_control);

var script_jquery = document.createElement("script");
script_jquery.src = 'toolbar/js/jquery-1.11.0.min.js';
script_jquery.async = false;
document.body.appendChild(script_jquery);

var script_toolbar = document.createElement("script");
script_toolbar.src = 'toolbar/js/jquery.toolbar.js';
script_toolbar.async = false;
document.body.appendChild(script_toolbar);

var fiveM = function(){};
var fm = fiveM.prototype = {
	/*************初始化方法******************/
	init:function (canvas,cam,light,helpGrid) {
		fiveM.prototype.width = document.getElementById(canvas||'canvas3d').clientWidth;//获取画布「canvas3d」的宽
		fiveM.prototype.height =  document.body.clientHeight;// document.getElementById(canvas||'canvas3d').clientHeight;//获取画布「canvas3d」的高;
		fm.initThree(canvas,true);//抗锯齿效果设置成true
		fm.initCamera(cam);
		fm.initScene();
		fm.initLight(light);
		fm.initHelpGrid(helpGrid);
		fiveM.prototype.controls = new THREE.OrbitControls(fm.camera);
		fiveM.prototype.controls.addEventListener('mousemove', fm.updateControls);
		/****常量初始化****/
		//物体对象容器
		fiveM.prototype.objects = [];
		fiveM.prototype.undo=[];
		fiveM.prototype.dbLeftClick=0;
		fiveM.prototype.dbRightClick=0;
		
	},
	initThree:function(canvas,ant){
		fiveM.prototype.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: ant});
		fiveM.prototype.renderer.setSize(fm.width, fm.height);
		document.getElementById(canvas||'canvas3d').appendChild(fm.renderer.domElement);
		//fiveM.prototype.renderer.setClearColor(0x1b7ace, 1.0);//刷新色，暂时不知道何用。2017-01-15
		fiveM.prototype.renderer.shadowMap.enabled = true;//
		fiveM.prototype.renderer.shadowMapSoft = true;
		fiveM.prototype.mouse = new THREE.Vector2();
		fiveM.prototype.raycaster = new THREE.Raycaster();
		
		//事件
		fiveM.prototype.renderer.domElement.addEventListener('mousedown', fm.onMouseDown, false);
		fiveM.prototype.renderer.domElement.addEventListener('mousemove', fm.onMouseMove, false);
		fiveM.prototype.renderer.domElement.addEventListener('mousewheel', fm.onMouseScroll, false);
	},
	
	initCamera:function(cam){
		if(!cam){
			cam = {
				//相机属性
				//默认情况下相机的上方向为Y轴，右方向为X轴，沿着Z轴朝里（视野角：fov 纵横比：aspect 相机离视体积最近的距离：near 相机离视体积最远的距离：far）
				fov:45,
				aspect:fm.width / fm.height,
				near:1,
				far:100000,
				name:'mainCamera',
				//位置相关
				position:{
					x:0,
					y:200,
					z:-350
				},
				up:{
					x:0,
					y:1,
					z:0
				},
				lookAt:{
					x:1000,
					y:100,
					z:100
				}};
		}
		fiveM.prototype.camera = new THREE.PerspectiveCamera(cam.fov||45, cam.aspect||fm.width / fm.height, cam.near||1, cam.far||10000);
		fiveM.prototype.camera.name = cam.name||'mainCamera';
		fiveM.prototype.camera.position.x = cam.position.x||-300;
		fiveM.prototype.camera.position.y =cam.position.y||100;
		fiveM.prototype.camera.position.z =cam.position.z||-180;
		fiveM.prototype.camera.up.x = cam.up.x||0;
		fiveM.prototype.camera.up.y = cam.up.y||1;
		fiveM.prototype.camera.up.z = cam.up.z||0;
		fiveM.prototype.camera.lookAt({ x: cam.lookAt.x||0, y: cam.lookAt.y||0, z: cam.lookAt.z||0 });
		//console.info(_fm.camera);
	},
	initScene:function(){
		fiveM.prototype.scene = new THREE.Scene();
	},
	initLight:function(lgt){
		/*
		AmbientLight: 环境光，基础光源，它的颜色会被加载到整个场景和所有对象的当前颜色上。
		PointLight：点光源，朝着所有方向都发射光线
		SpotLight ：聚光灯光源：类型台灯，天花板上的吊灯，手电筒等
		DirectionalLight：方向光，又称无限光，从这个发出的光源可以看做是平行光.
		*/
		if(!lgt){
			lgt = {
				//环境光色
				baseColor:0xcccccc,
				//环境光线位置
				baseLightPosition:{
					x:0,
					y:0,
					z:0
				},
				//点光源色
				pointLightColor:0x555555,
				//点光源位置
				pointLightPosition:{
					x:0,
					y:350,
					z:0
				},
				shadow:{
					near:1,
					far:5000,
					castShadow:true
				}
			}
		}
		var light = new THREE.AmbientLight(lgt.baseColor||0xcccccc);
		light.position.set(lgt.baseLightPosition.x||0, lgt.baseLightPosition.y||0,lgt.baseLightPosition.z||0);
		fiveM.prototype.scene.add(light);
		
		var light2 = new THREE.PointLight(lgt.pointLightColor||0x555555);
		light2.shadow.camera.near =lgt.shadow.near||1;
		light2.shadow.camera.far = lgt.shadow.far||5000;
		light2.castShadow = lgt.shadow.castShadow||true;//表示这个光是可以产生阴影的

		light2.position.set(lgt.pointLightPosition.x||0, lgt.pointLightPosition.y||350, lgt.pointLightPosition.z||0);
	   
		fiveM.prototype.scene.add(light2);
	},
	 //创建网格线
	initHelpGrid:function (showHelpGrid) {
	   if (showHelpGrid) {
		   var helpGrid = new THREE.GridHelper(1000, 50);
		   fiveM.prototype.scene.add(helpGrid);
	   }
	},
	//渲染
	render:function(){
		fiveM.prototype.renderer.render(fm.scene, fm.camera);
	},
	
	/*************封装方法**************/
	assembleObjects:function(){
		fiveM.prototype.scene.traverse(function (child) {
			if (child instanceof THREE.Mesh) {
				objects.push(child);
			}
		});
	},
	onMouseDown:function(e){
		if(!e){
			e=window.event;
		}
		if(e.button == 0){
			fm.dbLeftClick++;
		}else if(e.button == 2){
			fm.dbRightClick++;
		}

		setTimeout(function () { fm.dbRightClick =0,fm.dbLeftClick=0}, 200);
		if(fm.dbLeftClick<2 && fm.dbRightClick<2){
			//return;
		}
		e.preventDefault();
		fm.raycaster.setFromCamera(fm.mouse, fm.camera);
		if(!fm.objects){
			assembleObjects();
		}
		var intersects = fm.raycaster.intersectObjects(fm.objects);
		if (intersects.length > 0) {
			fm.controls.enabled = false;
			var SELECTED = intersects[0].object;
			
			//双击左键消失
			if(fm.dbLeftClick>=2){
				fm.scene.remove(SELECTED)
				for(var fi=0;fi<fm.objects.length;fi++){
					if(fm.objects[fi].name==SELECTED.name){
						//放入undo数组
						fm.undo.push(fm.objects[fi]);
						fm.objects.splice(fi,1);
					}
				}
			}else if(fm.dbLeftClick==1){
				//左键单击事件。用户自定义扩展
				//TODO SELECTED 是mesh对象 应该做交互的一些事情，这里还没想好怎么处理 2017-01-15 20:22
				if(typeof(fm.leftClickMesh) == 'function'){
						//需要自定义扩展leftClickMesh
						fm.leftClickMesh(SELECTED.name);
				}
			}else if(fm.dbRightClick==1){
				//右键单击事件，用户自定义扩展
				if(typeof(fm.rightClickMesh) == 'function'){
					fm.rightClickMesh(SELECTED.name);
				}
			}
			console.log(SELECTED.name);
			fm.controls.enabled = true;
		}
		
		//双击右键恢复
		if(fm.dbRightClick>=2){
			fm.controls.enabled = false;
			//undo数组
			if(fm.undo.length>0){
				var undoMesh = fm.undo.pop();
				fm.scene.add(undoMesh);
				fm.objects.push(undoMesh);
			}
			fm.controls.enabled = true;
		}
	},
	onMouseMove:function(e){
		if(!e){
			e=window.event;
		}
		 e.preventDefault();
		fm.mouse.x = (e.clientX / fm.width) * 2 - 1;
		fm.mouse.y = -(e.clientY / fm.height) * 2 + 1;
		fm.raycaster.setFromCamera(fm.mouse, fm.camera);
		//renderer.render(scene, camera);
		fm.render(fm.scene,fm.camera);
	},
	onMouseScroll:function(){
		fm.render(fm.scene,fm.camera);
	},
	updateControls:function updateControls(){
		//fm.controls.update();
	},
	//创建对象
	create:function(arr,isRender){
		var o = null;
		if(! arr instanceof Array){
			console.log("err in create : need Array");
			return;
		}else{
			var tempArr = fm.checkName(arr);
			while(tempArr.length){
				var obj = tempArr.pop(1);
				var texture = "";
				var materials = [];
				//公用材料属性
				var commonMaterial = {
					color: obj.color||0xFFFFFF,
					transparent:obj.transparent||false,
					opacity:obj.opacity||1,
				};
				//单面贴图使用材料属性，用于控制需要贴图面的纹理
				var singleMaterial = {
					color: obj.color||0xFFFFFF,
					transparent:obj.transparent||false,
					opacity:obj.opacity||1,
				};
				
				//创建对象；
				switch(obj.type){
					//立方体
					case "cube": 
					if(obj.map!= undefined ){
						debugger;
						if(typeof(obj.map)!=='string'){
							var texture= new THREE.CanvasTexture( obj.map );
							texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
							texture.repeat.set(1,1);
							singleMaterial.map = texture;
						}else{
								var textureLoader = new THREE.TextureLoader();
								singleMaterial.map = textureLoader.load(obj.map);
						}
						//可能多面贴图
						/*
							up     : 000001
							bottom : 000010
							left   : 000100
							right  : 001000
							front  : 010000
							bebind : 100000
						*/
						var bitMap = {
							"top"    : 2,
							"bottom" : 4,
							"left"   : 8,
							"right"  : 16,
							"front"  : 32,
							"behind" : 64
						};
						var bitValue = 0;
						if(! obj.texture.direction instanceof Array){
							console.log("texture.direction is not Array");
							return;
						}
						for(var arrVar=0;arrVar<obj.texture.direction.length;arrVar++){
							if(bitMap[obj.texture.direction[arrVar]] == undefined){
								console.log("texture.direction.value is illegal");
								return;
							}else{
								bitValue += bitMap[obj.texture.direction[arrVar]]; 
							}
						}
						materials.push(
							new THREE.MeshBasicMaterial( 
								 (bitValue&bitMap.top == bitMap.top?singleMaterial:commonMaterial)
							 ),
							new THREE.MeshBasicMaterial(
								((bitValue&bitMap.bottom) == bitMap.bottom?singleMaterial:commonMaterial)
							),
							new THREE.MeshBasicMaterial(
								((bitValue&bitMap.left) == bitMap.left?singleMaterial:commonMaterial)
							),
							new THREE.MeshBasicMaterial(
								((bitValue&bitMap.right) == bitMap.right?singleMaterial :commonMaterial)
							),
							new THREE.MeshBasicMaterial(
								((bitValue&bitMap.front) == bitMap.front?singleMaterial :commonMaterial)
							),
							new THREE.MeshBasicMaterial(
								((bitValue&bitMap.behind) == bitMap.behind?singleMaterial :commonMaterial)
							)
						);
						o = new THREE.Mesh(
								 new THREE.CubeGeometry(obj.w,obj.h,obj.d),                
								 new THREE.MultiMaterial(materials)
								 );
					}else{
						o = new THREE.Mesh(
							new THREE.CubeGeometry(obj.w,obj.h,obj.d),                
							new THREE.MeshLambertMaterial( 
								commonMaterial
							)
						);
					}
					
						break;
					//圆柱体
					case "cylinder": 
						//t:top b:bottom h:height segment:s 
						o = new THREE.Mesh(
								new THREE.CylinderGeometry(obj.t,obj.b,obj.h,obj.s),
								new THREE.MeshLambertMaterial({
								//	map:texture,
									//side:THREE.FrontSide,
									color: obj.color||0xFFFFFF,
									transparent:obj.transparent||false,
									opacity:obj.opacity||1,
									//blending:THREE.AdditiveBlending//使用饱和度叠加渲染(作用未知)
								}));
						break;
				}
				o.name = obj.name;
				
				//旋角
				o.rotation.set(obj.rotation.x||0,obj.rotation.y||0,obj.rotation.z||0);
				o.position.set(obj.position.x||0,obj.position.y||0,obj.position.z||0);

				fiveM.prototype.objects.push(o);
				fiveM.prototype.scene.add(o);
			}
		}
					
		//自动渲染
		if(isRender||isRender==undefined){
			fm.render();
		}
	},
	//校验名称是否已经存在
	checkName:function(arr){
		if(!arr){
		console.log("err in checkName : arr is undefined!");
		return;
		}
		var tempArr = arr.slice();
		var tempObj = {};
		for(var i=0;i<tempArr.length;i++){
			if(tempArr[i].name){
				if(tempObj[tempArr[i].name]){
					console.log("err in checkName : name has existed");
					return;
				}
				tempObj[tempArr[i].name]=tempArr[i].name;
			}else{
				console.log("err in checkName : name is undefined");
				return;
			}
		}
		return tempArr;
	},
	//创建动态纹理
	createPicture:function(textPicture){
		var canvas2d = document.createElement("canvas");
		canvas2d.width = 300;
		canvas2d.height = 200;
		var context = canvas2d.getContext('2d');
		//TODO 以下两个坐标需要设置成动态配置
		context.fillStyle = "#BEC9BE";
		context.fillRect( 0, 0, 300, 200 );
		context.fillStyle = "yellow";
		context.fillRect( 95, 75, 115, 85 );
		context.font = textPicture.font||"Normal 40px Arial";
		context.textAlign = textPicture.textAligh||'center';
		context.fillStyle = textPicture.fillStyle||"red";
		context.fillText(textPicture.text,textPicture.x||300,textPicture.y||200);
		//document.body.appendChild(canvas2d);
		return canvas2d;
	},
	 
	extend:function(funcName,funcBody){
		if(typeof(funcBody)!="function" ){
			console.log("err in extend : target is not a function");
			return;
		}
		if(fiveM.prototype[funcName]){
			console.log("warning in extend : "+funcName+" has been defined");
		}
		fiveM.prototype[funcName] = funcBody;
	}
	
};
	  
 
