(function(){
  var exprEl=document.getElementById('expr'), histEl=document.getElementById('hist');
  var expr='', justEvaluated=false, degMode=true;

  // key layout: [label, insert-text or action, css class]
  var keys=[
    ['sin','sin(','fn'],['cos','cos(','fn'],['tan','tan(','fn'],['log','log(','fn'],['ln','ln(','fn'],
    ['√','√(','fn'],['x²','^2','fn'],['xʸ','^','fn'],['n!','!','fn'],['1/x','inv','fn'],
    ['π','π','fn'],['e','e','fn'],['(','(','fn'],[')',')','fn'],['%','%','fn'],
    ['AC','clear','clr'],['DEL','del','clr'],['±','neg','op'],['÷','÷','op'],['×','×','op'],
    ['7','7'],['8','8'],['9','9'],['−','−','op'],['+','+','op'],
    ['4','4'],['5','5'],['6','6'],['0','0'],['.','.'],
    ['1','1'],['2','2'],['3','3'],['Ans','ans','fn'],['=','eval','eq']
  ];
  var grid=document.getElementById('grid');
  keys.forEach(function(k){
    var b=document.createElement('button');
    b.type='button'; b.textContent=k[0]; b.className=k[2]||'';
    b.addEventListener('click',function(){press(k[1]);});
    grid.appendChild(b);
  });

  var lastAnswer='0';

  function render(){
    exprEl.textContent=expr===''?'0':expr;
    exprEl.classList.toggle('long',expr.length>14);
  }

  function press(v){
    if(v==='clear'){expr='';histEl.textContent='';justEvaluated=false;render();return;}
    if(v==='del'){
      if(justEvaluated){expr='';justEvaluated=false;}
      else expr=expr.replace(/(sin\(|cos\(|tan\(|log\(|ln\(|√\(|.)$/,'');
      render();return;
    }
    if(v==='eval'){evaluate();return;}
    if(v==='neg'){toggleSign();return;}
    if(v==='inv'){expr='1÷('+(expr||'0')+')';justEvaluated=false;evaluate();return;}
    if(v==='ans'){startNew(true);expr+=lastAnswer;render();return;}

    var isOp=/^[+−×÷^!%]$/.test(v)||v==='^2';
    var isPostfix=(v==='!'||v==='%'||v==='^2');
    if(justEvaluated){
      // continue from the result with an operator, otherwise start fresh
      if(isOp){expr=lastAnswer;}else{expr='';}
      justEvaluated=false;histEl.textContent='';
    }
    if(!isPostfix&&/^[+×÷^]$/.test(v)&&expr==='')return;
    // replace a trailing binary operator instead of stacking two
    if(/^[+−×÷^]$/.test(v)&&/[+−×÷^]$/.test(expr)){expr=expr.slice(0,-1);}
    expr+=v;
    render();
  }

  function startNew(){ if(justEvaluated){expr='';justEvaluated=false;histEl.textContent='';} }

  function toggleSign(){
    if(justEvaluated){expr=lastAnswer;justEvaluated=false;}
    var m=expr.match(/(\d+\.?\d*|\.\d+)$/);
    if(!m){expr+='−';render();return;}
    var i=expr.length-m[0].length;
    if(expr[i-1]==='−'&&(i-1===0||/[+−×÷^(]/.test(expr[i-2]))){expr=expr.slice(0,i-1)+expr.slice(i);}
    else expr=expr.slice(0,i)+'−'+expr.slice(i);
    render();
  }

  // ---------- parser (no eval) ----------
  function tokenize(s){
    var t=[],i=0,m;
    while(i<s.length){
      var c=s[i];
      if(c===' '){i++;continue;}
      if((m=s.slice(i).match(/^(\d+\.?\d*|\.\d+)/))){t.push({t:'num',v:parseFloat(m[0])});i+=m[0].length;continue;}
      if((m=s.slice(i).match(/^(sin|cos|tan|log|ln)/))){t.push({t:'fn',v:m[0]});i+=m[0].length;continue;}
      if(c==='√'){t.push({t:'fn',v:'sqrt'});i++;continue;}
      if(c==='π'){t.push({t:'num',v:Math.PI});i++;continue;}
      if(c==='e'){t.push({t:'num',v:Math.E});i++;continue;}
      if('+−×÷^!%()'.indexOf(c)>-1){t.push({t:'op',v:c});i++;continue;}
      throw new Error('bad char');
    }
    return t;
  }

  function parse(tokens){
    var p=0;
    function peek(){return tokens[p];}
    function isOp(v){var k=tokens[p];return k&&k.t==='op'&&k.v===v;}
    function startsFactor(){
      var k=tokens[p]; return k&&(k.t==='num'||k.t==='fn'||(k.t==='op'&&k.v==='('));
    }
    function expression(){
      var v=term();
      while(isOp('+')||isOp('−')){var o=tokens[p++].v;var r=term();v=o==='+'?v+r:v-r;}
      return v;
    }
    function term(){
      var v=unary();
      for(;;){
        if(isOp('×')||isOp('÷')){
          var o=tokens[p++].v;var r=unary();
          if(o==='÷'){if(r===0)throw new Error('div0');v=v/r;}else v=v*r;
        } else if(startsFactor()){ v=v*unary(); } // implicit multiplication: 2π, 3(4+1)
        else break;
      }
      return v;
    }
    function unary(){
      if(isOp('−')){p++;return -unary();}
      if(isOp('+')){p++;return unary();}
      return power();
    }
    function power(){
      var base=postfix();
      if(isOp('^')){p++;var ex=unary();return Math.pow(base,ex);}
      return base;
    }
    function postfix(){
      var v=primary();
      for(;;){
        if(isOp('!')){p++;v=factorial(v);}
        else if(isOp('%')){p++;v=v/100;}
        else break;
      }
      return v;
    }
    function primary(){
      var k=tokens[p++];
      if(!k)throw new Error('end');
      if(k.t==='num')return k.v;
      if(k.t==='fn'){
        if(!isOp('('))throw new Error('fn');
        p++;var a=expression();
        if(isOp(')'))p++; // allow missing close
        return applyFn(k.v,a);
      }
      if(k.t==='op'&&k.v==='('){
        var v=expression();
        if(isOp(')'))p++;
        return v;
      }
      throw new Error('syntax');
    }
    var result=expression();
    if(p<tokens.length)throw new Error('syntax');
    return result;
  }

  function clean(v){return Math.round(v*1e12)/1e12;}
  function applyFn(f,a){
    var r=degMode?a*Math.PI/180:a;
    switch(f){
      case 'sin':return clean(Math.sin(r));
      case 'cos':return clean(Math.cos(r));
      case 'tan':
        if(Math.abs(clean(Math.cos(r)))===0)throw new Error('tan');
        return clean(Math.tan(r));
      case 'log':if(a<=0)throw new Error('log');return Math.log10(a);
      case 'ln':if(a<=0)throw new Error('ln');return Math.log(a);
      case 'sqrt':if(a<0)throw new Error('sqrt');return Math.sqrt(a);
    }
  }
  function factorial(n){
    if(n<0||n!==Math.floor(n)||n>170)throw new Error('fact');
    var r=1;for(var i=2;i<=n;i++)r*=i;return r;
  }

  function format(n){
    if(!isFinite(n))throw new Error('range');
    var r=parseFloat(n.toPrecision(12));
    if(r!==0&&(Math.abs(r)>=1e15||Math.abs(r)<1e-9))return r.toExponential(6).replace(/\.?0+e/,'e').replace('-','−');
    return String(r).replace('-','−');
  }

  function evaluate(){
    if(expr==='')return;
    var src=expr;
    // auto-close open parentheses
    var open=(src.match(/\(/g)||[]).length-(src.match(/\)/g)||[]).length;
    for(var i=0;i<open;i++)src+=')';
    try{
      var val=parse(tokenize(src));
      var out=format(val);
      histEl.textContent=src+' =';
      lastAnswer=out;
      expr=out;
      justEvaluated=true;
    }catch(e){
      histEl.textContent=src;
      expr='Error';
      justEvaluated=true;
      lastAnswer='0';
    }
    render();
  }

  // ---------- angle mode ----------
  var degBtn=document.getElementById('deg'),radBtn=document.getElementById('rad');
  function setMode(d){degMode=d;degBtn.classList.toggle('on',d);radBtn.classList.toggle('on',!d);}
  degBtn.addEventListener('click',function(){setMode(true);});
  radBtn.addEventListener('click',function(){setMode(false);});

  // ---------- keyboard ----------
  document.addEventListener('keydown',function(e){
    if(e.ctrlKey||e.metaKey||e.altKey)return;
    var k=e.key,map={'*':'×','/':'÷','-':'−'};
    if(/^[0-9.]$/.test(k)||'+()^!%'.indexOf(k)>-1){press(k);e.preventDefault();}
    else if(map[k]){press(map[k]);e.preventDefault();}
    else if(k==='Enter'||k==='='){press('eval');e.preventDefault();}
    else if(k==='Backspace'){press('del');e.preventDefault();}
    else if(k==='Escape'||k==='Delete'){press('clear');e.preventDefault();}
    else if(k==='p'){press('π');}
  });

  render();
})();
