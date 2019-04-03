class Landing {
	/* OPTIONS
		background: canvas background
		windForce: force of wind
		windDir: right/left (1|-1)
		flakes: number of flakes
		floatRange: angle of snow float range
		radiusRange: sizing of snow [min,max]
		color: color of particles
		speedMult: speed mutliplier (otherwise based purely on radius)
	*/

	constructor(elem, options) {
		var self = this;
		this.elem = elem;
		this.bg = options.background || 'transparent';
		this.canvas = document.createElement('canvas');
		this.ctx = this.canvas.getContext('2d');
		window.addEventListener('resize', function() {self.resize();});
		this.elem.appendChild(this.canvas);
		this.snow = [];
		this.windForce = options.windForce || 2;
		this.windDir = options.windDir || 1;
		this.numFlakes = options.flakes || 100;
		this.floatRange = options.floatRange || 1;
		this.radiusRange = options.radiusRange || [2, 5];
		this.speedMult = options.speedMult || 15;
		this.alphaRange = options.alphaRange || [.7, 1];
		this.color = options.color || 'white';
		this.updateCanvas();
		for(var i = 0;i<this.numFlakes;i++) {
			this.addFlake(this.random(0,this.canvas.width),this.random(0,this.canvas.height));
		}
		this.drawFlakes();
	}
	updateCanvas() {
		this.canvas.style.position = 'absolute';
		this.canvas.style.zIndex = 0;
		this.canvas.style.top = this.canvas.style.left = 0;
		this.canvas.style.pointerEvents = 'none';
		if(this.bg.indexOf('gradient') > -1) {
			this.canvas.style.backgroundImage = this.bg;
		}
		else {
			this.canvas.style.backgroundColor = this.bg;
		}
		this.resize();
	}
	resize() {
		this.canvas.width = this.elem.offsetWidth;
		this.canvas.height = this.elem.offsetHeight;
	}
	addFlake(x,y) {
		var r = this.random(this.radiusRange[0],this.radiusRange[1]);
		var flake = {x, y, r,
			spd: this.speedMult/r,
			alpha: this.random(this.alphaRange[0],this.alphaRange[1]),
			color: this.color,
			angle: this.random(Math.PI/2 - this.floatRange,Math.PI/2 + this.floatRange),
			dir: Math.random() > .5 ? -1 : 1,
		}
		this.snow.push(flake);
	}
	drawFlakes() {
		var self = this;
		this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
		this.snow.forEach(function(s) {
			s.x += s.spd * Math.cos(s.angle) + (self.windForce*self.windDir);
			s.y += s.spd * Math.sin(s.angle);
			s.angle += s.dir*Math.random()*self.floatRange/(s.r*10);
			if(s.angle > Math.PI/2 + self.floatRange) {s.angle = Math.PI/2 + self.floatRange;s.dir = -1;}
			else if(s.angle < Math.PI/2 - self.floatRange) {s.angle = Math.PI/2 - self.floatRange;s.dir = 1;}
			self.ctx.beginPath();
			self.ctx.fillStyle = s.color;
			self.ctx.globalAlpha = s.alpha;
			self.ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
			self.ctx.fill();
			if(s.y > self.canvas.height) {
				s.y = -s.r*2;
				s.x = self.random(0,self.canvas.width);
			}
			if(s.x < -s.r) {
				s.x = self.canvas.width+s.r; 
			}
			else if(s.x > self.canvas.width+s.r) {
				s.x = -s.r;
			}
		});
		window.requestAnimationFrame(function() {self.drawFlakes()});
	}
	random(min,max) {
		return Math.random() * (max - min) + min;
	}
}



//ON LOAD
window.addEventListener('load', function() {
	new Landing(document.getElementById('hero'), {
		background: 'linear-gradient(to bottom,rgba(0, 117, 174, 0.5) 0%, #114763 100%)',
		flakes: 170,
		windForce: 2,
		windDir: 1,
		floatRange: .4,
		alphaRange: [.8,1],
		radiusRange: [3,6],
		speedMult: 15,
		color: 'white'
	});
	window.addEventListener('resize', function() {
		manageScroll();
		slideTestimonial(document.getElementById('t1'), 0);
	});
	window.addEventListener('scroll', manageScroll);
	manageScroll();
	testimonial(document.getElementById('t1'));
});


function manageScroll() {
	if(window.scrollY >= window.innerHeight - 20) {
		document.getElementById('nav').classList.add('colored');
	}
	else {
		document.getElementById('nav').classList.remove('colored');
	}
	document.getElementById('layer1').style.top = window.scrollY + "px";
	document.getElementById('layer2').style.top = window.scrollY*.8 + "px";
	document.getElementById('layer3').style.top = window.scrollY/3 + "px";
	document.getElementById('heroWrap').style.top = window.scrollY/5 + "px";
}
function testimonial(elem) {
	var arrows = elem.getElementsByClassName('arrow');
	elem.dataset.slides = elem.getElementsByClassName('quote').length;
	elem.dataset.panel = 0;
	elem.dataset.canslide = 'true';
	arrows[0].onclick = function() {
		slideTestimonial(this.parentNode, -1);
	}
	arrows[1].onclick = function() {
		slideTestimonial(this.parentNode, 1);
	}
	elem.addEventListener('touchstart', function(e) {
		elem.dataset.xstart = e.touches[0].clientX;
		elem.dataset.ystart = e.touches[0].clientY;
		elem.dataset.canslide = 'true';
	});
	elem.addEventListener('touchmove', function(e) {
		if(elem.dataset.canslide !== 'true') {return;}
		var dx = e.touches[0].clientX - parseFloat(elem.dataset.xstart), 
				dy = e.touches[0].clientY - parseFloat(elem.dataset.ystart);
		if(Math.abs(dx) > Math.abs(dy) && Math.abs(dx) >= elem.offsetWidth/2) {
			var dir = dx > 0 ? -1 : 1;
			if(parseInt(elem.dataset.panel) + dir >= 0 && parseInt(elem.dataset.panel) + dir <= parseInt(elem.dataset.slides) - 1) {
				slideTestimonial(elem, dir);
				elem.dataset.canslide = 'false';
			}
		}
	});
	elem.addEventListener('mousewheel', function(e) {
		if(elem.dataset.canslide !== 'true') {return;}
			var dir = e.deltaX > 0 ? 1 : -1;
			if(Math.abs(e.deltaX) > 40 && parseInt(elem.dataset.panel) + dir >= 0 && parseInt(elem.dataset.panel) + dir <= parseInt(elem.dataset.slides) - 1) {
				slideTestimonial(elem, dir);
				elem.dataset.canslide = 'false';
				setTimeout(function() {
					elem.dataset.canslide = 'true';
				}, 1000);
			}
	});
	arrows[0].style.display = "none";
}
function slideTestimonial(elem,dir) {
	var panel = parseInt(elem.dataset.panel) || 0;
	var arrows = elem.getElementsByClassName('arrow');
	elem.scrollTo({
		top: 0,
		left: elem.offsetWidth * (panel + dir),
		behavior: dir === 0 ? 'auto' : 'smooth'
	})
	elem.dataset.panel = panel + dir;
	if(panel + dir <= 0) {
		arrows[0].style.display = "none";
	}
	else {
		arrows[0].style.display = "block";
	}
	if(panel + dir >= parseInt(elem.dataset.slides) -1) {
		arrows[1].style.display = "none";
	}
	else {
		arrows[1].style.display = "block";
	}
}
function toggleMenu(open) {
	if(open || !document.getElementById('menu').classList.contains('open') && open === undefined) {
		document.getElementById('menubtn').classList.add('active');
		document.getElementById('menu').classList.add('open');
		document.getElementById('menushade').style.display = "block";
	}
	else {
		document.getElementById('menubtn').classList.remove('active');
		document.getElementById('menu').classList.remove('open');
		document.getElementById('menushade').style.display = "none";
	}
}
function goTo(elem) {
	window.scrollTo({
	  top: document.getElementById(elem).offsetTop - document.getElementById('nav').offsetHeight,
	  left: 0,
	  behavior: 'smooth'
	});
	toggleMenu(false);
}