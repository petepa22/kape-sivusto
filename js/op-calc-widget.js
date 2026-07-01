(function(){"use strict";const v=(t,e)=>{if(t){var a=document.createElement(t);return typeof e=="object"&&Object.keys(e).forEach(function(s){if(s.indexOf("data-")>-1)a.setAttribute(s,e[s]);else if(s==="children"&&e[s].length){if(typeof e[s]!="object")throw new Error("function el: children prop must be defined as array");e[s].forEach(function(c){a.appendChild(typeof c=="string"?document.createTextNode(c):c)})}else a[s]=e[s]}),a}throw new Error("Cant create element without type.")},A=t=>{const e=parseInt(t.value),a=()=>t.value=parseInt(t.min);isNaN(e)&&a();try{e>parseInt(t.max)&&(t.value=t.max),e<parseInt(t.min)&&(t.value=t.min)}catch(s){a()}},k={calc:{teaserKerta:"Maksa 1 kk päästä toimituksesta ilman korkoja ja kuluja tai lyhennä sopivalla kuukausierällä!",teaserTili:"30 päivää korotonta maksuaikaa jokaiselle ostokselle",ctaButton:"Tutustu ja hae",inputAmountLabelKerta:"Rahoituksen määrä",inputAmountLabelTili:"Luoton määrä",product:{openButtonTextStart:"Tai",openButtonTextEnd:"rahoituksella."},linkMore:"Lue lisää maksutavasta"}},j=t=>`
  <input class=op-keti__amount_payload type="hidden" name="cmpid" value=".haarta.4_${t.initAmount?t.initAmount:5e3}-17..site.partner.mn_sl_hark_widget.self">
`,P=t=>t.replace(".",","),F=t=>P(t.toFixed(2)),T=t=>t.details.interest_type==="FIXED"?`kun luoton kiinteä korko on <span>${t.details.fixed_interest.toFixed(2).replace(/\./g,",")} %</span>`:`kun luoton korko on OP-prime + <span>${t.details.interest_margin.toFixed(2).replace(/\./g,",")} %</span> (<span>${t.details.interest.toFixed(2).replace(/\./g,",")} %</span> ${B()})`,M=t=>`
  <style>
  ${t.type!=="product"?`.op-keti__widget.op-keti__type--${t.type} .op-keti__btn-open,`:""}
  .op-keti__type--${t.type} .op-keti__form-submit-btn,
  .op-keti__type--${t.type} .op-keti__form-submit-btn:hover,
  .op-keti__type--${t.type} .op-keti__form-submit-btn:focus {
    background: ${t.colorPrimary};
    color: ${t.colorSecondary};
    border-color: ${t.colorPrimary};
  }

  .op-keti__type--${t.type} button.op-keti__btn:focus,
  .op-keti__type--${t.type} button.op-keti__sum-button.selected,
  .op-keti__type--${t.type} button.op-keti__sum-button.selected:focus,
  .op-keti__type--${t.type} input[type=number]:focus,
  .op-keti__container .op-keti__fieldset .op-keti__stepper:focus,
  .op-keti__type--${t.type} input[type=text]:focus {
    border-color: ${t.colorPrimary};
  }

  .op-keti__widget .op-keti__type--${t.type} button.op-keti__sum-button.selected {
    border: 2px solid ${t.colorPrimary};
  }

  .op-keti__widget.op-keti__type--${t.type} fieldset .op-keti__stepper[data-action=down]:before,
  .op-keti__widget.op-keti__type--${t.type} fieldset .op-keti__stepper[data-action=up]:before,
  .op-keti__widget.op-keti__type--${t.type} fieldset .op-keti__stepper[data-action=up]:after {
    background: ${t.colorPrimary};
  }

  .op-keti__widget.op-keti__type--${t.type} button.op-keti__btn.op-keti__sum-button:hover:not(:active):not(:focus) {
    border: 1px solid ${t.colorPrimary};
  }

  .op-keti__widget.op-keti__type--${t.type} fieldset.op-keti__range-wrap input[type="range"]::-webkit-slider-runnable-track {
    background: linear-gradient(${t.colorPrimary},${t.colorPrimary}) 0/var(--sx) 100% no-repeat, #fff !important;
  }

  .op-keti__widget.op-keti__type--${t.type} fieldset.op-keti__range-wrap input[type="range"]::-moz-range-progress {
    background: linear-gradient(${t.colorPrimary},${t.colorPrimary}) 0/var(--sx) 100% no-repeat, #fff !important;
  }

  .op-keti__widget.op-keti__type--${t.type} fieldset.op-keti__range-wrap input[type="range"]::-ms-fill-lower {
    background: ${t.colorPrimary} !important;
  }

  </style>
`,O=t=>({moreLink:t&&t.linkMore&&t.linkMore.length?`<p class="op-keti__read-more"><a href="${t.linkMore}" target="_blank">${t.texts&&t.texts.linkMore?t.texts.linkMore:k.calc.linkMore}</a></p>`:""}),D=t=>({content:`
<div class=op-keti__result-row>
  <div class="op-keti__label-container"></div>
  <div class="op-keti__result-container">
  <span class="${t.showInfo.paybackTime?"":"op-keti__hidden"}"">Takaisinmaksuaika <strong class=op-keti__result></strong></span>
  <span class="${t.showInfo.interestMargin?"":"op-keti__hidden"}">${t.details.interest_type==="FIXED"?"Kiinteä korko":"Korkomarginaali"} <strong class=op-keti__result-interest>${F(t.details.interest_type==="FIXED"?t.details.fixed_interest:t.details.interest_margin)} %${t.details.interest_type==="FIXED"?"":"*"}</strong></span>
  </div>
</div>`,product:`
<div class="op-keti__result-row ${t.showInfo.interestMargin?"":"op-keti__hidden"}">
  <span>${t.details.interest_type==="FIXED"?"Kiinteä korko":"Korkomarginaali"}</span><span class=op-keti__result-interest>${F(t.details.interest_type==="FIXED"?t.details.fixed_interest:t.details.interest_margin)} %${t.details.interest_type==="FIXED"?"":"*"}</span>
</div>

<div class="op-keti__result-row ${t.showInfo.realInterest?"":"op-keti__hidden"}">
  <span>Todellinen vuosikorko</span><span class=op-keti__result-realinterest>&nbsp;</span>
</div>

<div class="op-keti__result-row ${t.showInfo.paybackTime?"":"op-keti__hidden"}">
  <span>Takaisinmaksuaika</span><span class=op-keti__result></span>&nbsp;</span>
</div>

<div class="op-keti__result-row ${t.showInfo.costEstimate?"":"op-keti__hidden"}">
  <span>Kustannusarvio</span><span class=op-keti__result-overall>&nbsp;</span>
</div>`})[t.type],B=()=>{const t=new Date,e=t.getMonth()+1,a=t.getFullYear().toString().slice(-2);return`${e}/${a}`},w=(t,e)=>e==="solo"?{content:t.type==="content"&&(t.isSolo===!0||t.details.percentages.length===1),product:t.type==="product"&&(t.isSolo===!0||t.details.percentages.length===1)}:{content:t.type==="content"&&t.isSolo!==!0&&t.details.percentages.length>1,product:t.type==="product"&&t.isSolo!==!0&&t.details.percentages.length>1},K=(t,e)=>{const a=O(t),s=w(t,"solo"),c=w(t,"multi"),_=e.includes("kertaluotto")?k.calc.inputAmountLabelKerta:k.calc.inputAmountLabelTili,o=e.includes("kertaluotto")?k.calc.teaserKerta:k.calc.teaserTili;return`
  ${M(t)}

  <form action="${t.linkCta}" method="GET" target="_blank">

    ${t.type==="content"?"<h1 class=op-keti__heading>Maksa joustavasti erissä</h1>":""}

    <fieldset class="op-keti__fieldset ${t.showInput?"":"op-keti__hidden"}">
      <div class=op-keti__label-container>
        <label for=op-keti__input-amount><span class=op-keti__label--text>${t.texts&&t.texts.inputAmountLabel?t.texts.inputAmountLabel:_}&nbsp</span><span class=op-keti__label--helper>(<span class="op-keti__label--helper--min">${t.initAmountMin?parseFloat(t.initAmountMin).toLocaleString("fr"):parseFloat(t.details.min_amount).toLocaleString("fr")}</span> - ${parseFloat(t.details.max_amount).toLocaleString("fr")} €)<span></label>
      </div>
      <div class=op-keti__input-container>
        <button class="op-keti__btn op-keti__stepper" data-action=down type=button ${t.enableInputChanges?"":"disabled=true"}>&nbsp;</button>
        <div class=op-keti__input-wrapper>
          <input class=op-keti__input-amount name=init_amount type=number pattern="d+" min=${t.initAmountMin?t.initAmountMin:t.details.min_amount} max=${t.details.max_amount} value=${t.initAmount} data-step=1000 ${t.enableInputChanges?"":"disabled=true"}>
          <div class=op-keti__prefix class=op-prefix-euro ${t.enableInputChanges?"":"disabled=true"}><span class=op-keti__prefix--filler></span><span>&euro;</span></div>
        </div>
        <button class="op-keti__btn op-keti__stepper" data-action=up type=button ${t.enableInputChanges?"":"disabled=true"}>&nbsp;</button>
      </div>
    </fieldset>

    ${c.product?`<p class="op-keti__teaser-text">${t.texts&&t.texts.teaser?t.texts.teaser:o}</p>`:""}

    <fieldset class=op-keti__fieldset class=op-keti__sum-buttons-wrap>
      ${c.content?"<div class=op-keti__label-container><label for=op-keti__sum-buttons>Kuukausierä</label></div>":""}
      <div class="op-keti__input-container">
        <div class=op-keti__sum-buttons></div>
      </div>
    </fieldset>

    ${c.product&&t.texts&&t.texts.altTeaser?`<p class="op-keti__teaser-text">${t.texts.altTeaser}</p>`:""}

    ${s.content?`<fieldset class=op-keti__range-wrap><input type=range min="${t.initAmountMin?t.initAmountMin:t.details.min_amount} max=${t.details.max_amount}" max=50000 step=500></fieldset>`:""}

    <div class="op-keti__result-rows">
      ${t.type==="product"&&t.showInfo.costEstimate&&e.includes("kertaluotto")?'<div class="op-keti__result-row op-keti__result-row-heading"><span><strong>Esimerkkilaskelma luoton kustannuksista</strong></span></div>':""}
      ${s.product?'<div class="op-keti__result-row"><span>Kuukausierä</span><span class=op-keti__result-payback></span></div>':""}
      ${e.includes("kertaluotto")?D(t):""}
    </div>

    ${s.product?`<p class="op-keti__teaser-text">${o}</p>`:""}

    <div class="op-keti__form-submit-wrap">
      <input class=op-keti__input-payback type="hidden" name="init_payment" value="0">
      ${j(t)}
      <input class="op-keti__form-submit-btn ${t.showCta?"":"op-keti__hidden"}" type="submit" value="${t.texts&&t.texts.ctaButton?t.texts.ctaButton:k.calc.ctaButton}">
    </div>

    ${s.product?`<p class="op-keti__teaser-text">${o}</p>`:""}

    <div>
      ${a.moreLink}
    </div>
  </form>

  <footer>
    ${s.content?'<div class=op-keti__content-result--solo class="op-keti__result-row"><span>Kuukausierä alk.</span><span class=op-keti__result-payback></span></div>':""}

    <p>
      <small>
      ${e.includes("kertaluotto")?`${t.details.interest_type==="FIXED"?"":"* "}Rahoitus on kertaluotto, jonka todellinen vuosikorko <span>7 500</span> euron luotolle on <span>${t.details.example_calculation_annual_interest.toFixed(2).replace(/\./g,",")} %</span>, ${T(t)}, perustamismaksu <span>${t.details.opening_fee.toFixed(0).replace(/\./g,",")} €</span> ja laskutuspalkkio <span>${t.details.handling_fee.toFixed(0).replace(/\./g,",")} €/kk</span>. Arvioitu luoton kokonaiskustannus on <span>${t.details.example_calculation_total_payment.toFixed(2).replace(/\./g,",")} €</span>. Laskelma on tehty olettaen, että luotto on nostettu kokonaan, luoton korko sekä maksut ja palkkiot pysyvät samana koko luottoajan ja luotto maksetaan takaisin <span>${t.details.example_calculation_monthly_payment.toFixed(2).replace(/\./g,",")} €</span> minimilyhennyksin (1,70 % luoton määrästä) kuukauden välein, jolloin luottoaika on <span>${t.details.example_calculation_months.toFixed(0).replace(/\./g,",")} kk</span>. Luoton myöntää OP Yrityspankki Oyj, Gebhardinaukio 1, 00510 Helsinki.`:`${t.details.interest_type==="FIXED"?"":"* "}Tililuotto on jatkuvakäyttöinen luotto, jonka todellinen vuosikorko <span>7 500</span> euron luotolle on <span>${t.details.example_calculation_annual_interest.toFixed(2).replace(/\./g,",")} %</span>, ${T(t)}, perustamismaksu <span>${t.details.opening_fee.toFixed(0).replace(/\./g,",")} €</span> ja laskutuspalkkio <span>${t.details.handling_fee.toFixed(0).replace(/\./g,",")} €/kk</span>. Arvioitu luoton kokonaiskustannus on <span>${t.details.example_calculation_total_payment.toFixed(2).replace(/\./g,",")} €</span>. Laskelma on tehty olettaen, että luotto on nostettu kokonaan, luoton korko sekä maksut ja palkkiot pysyvät samana koko luottoajan ja luotto maksetaan takaisin <span>${t.details.example_calculation_monthly_payment.toFixed(2).replace(/\./g,",")} €</span> minimilyhennyksin (1,70 % luoton määrästä) kuukauden välein, jolloin luottoaika on <span>${t.details.example_calculation_months.toFixed(0).replace(/\./g,",")} kk</span>. Luoton myöntää OP Yrityspankki Oyj, Gebhardinaukio 1, 00510 Helsinki.`}
      </small>
    </p>
     ${t.type==="content"?`<button class="op-keti__form-submit-btn op-keti__form-submit-btn-alt ${t.showCta?"":"op-keti__hidden"}">${t.texts&&t.texts.ctaButton?t.texts.ctaButton:k.calc.ctaButton}</button>`:""}
  </footer>
  `};let h=1.5;function i(t,e,a=!1){return a?t.querySelectorAll(e):t.querySelector(e)}const m=(t,e)=>{const a=document.createEvent("HTMLEvents");a.initEvent(e,!1,!0),t.dispatchEvent(a)},I=(t,e,a)=>{let s=!1;const[c]=t;h=c,t.forEach((_,o)=>{const n=parseInt(i(a,".op-keti__input-amount").value,10),r=(_/100*n).toFixed(0),p=!!e[o],l=p?e[o]:v("button",{className:"op-keti__btn op-keti__sum-button",type:"button"});l.textContent=`${r} € / kk`,l.dataset.payback=r,l.dataset.percentage=_,l.style.display=r>50?"block":"none",r<=50&&(t[o+1]/100*n).toFixed(0)>50&&(l.style.display="block",l.dataset.payback=50,l.textContent=`${l.dataset.payback} € / kk`,h=_),r<=50&&o+1===t.length&&(l.style.display="block",l.dataset.payback=50,l.textContent=`${l.dataset.payback} € / kk`,h=_),e[o]&&e[o+1]&&e[o].style.display==="none"&&e[o].classList.contains("selected")&&(l.classList.remove("selected"),e[o+1].classList.add("selected"),s=!0),p||(l.addEventListener("click",()=>{i(a,"button.op-keti__sum-button",!0).forEach(d=>{d.classList.remove("selected")}),l.classList.add("selected"),m(i(a,".op-keti__input-amount"),"change")}),h===_&&(l.classList.add("selected"),s=!0),i(a,".op-keti__sum-buttons").appendChild(l),e.push(l))}),s&&m(i(a,".op-keti__input-amount"),"change")};function R(t,e){const a=w(e,"solo");let s=null;const c=e&&e.details.percentages&&e.details.percentages.length?e.details.percentages.filter(o=>o>=1.5):[1.5,1.7,2.1,2.8,3.3,5,9],_=[];this.setAmount=o=>{const n=i(t,".op-keti__input-amount"),r=parseInt(o,10);return parseInt(i(t,".op-keti__input-amount").value,10)===r?!1:(n.value=r,m(n,"change"),!0)},this.setAmountMin=o=>{const n=i(t,".op-keti__input-amount"),r=parseInt(o,10);return i(t,".op-keti__label--helper--min").textContent=String(r).toLocaleString("fr"),n.min=r,m(n,"change"),!0},i(t,".op-keti__stepper",!0).forEach(o=>{o.addEventListener("click",()=>{const n=o.parentElement.querySelector("input");switch(o.dataset.action){case"up":n.value=parseInt(n.value,10)+parseInt(n.dataset.step,10);break;case"down":n.value=parseInt(n.value,10)-parseInt(n.dataset.step,10);break}m(n,"change")})}),e.type==="content"&&i(t,".op-keti__form-submit-btn-alt").addEventListener("click",()=>{i(t,".op-keti__container form").submit()}),I(c,_,t),i(t,".op-keti__input-amount").addEventListener("change",async o=>{const n=o.currentTarget;A(n),I(c,_,t);const r=parseInt(n.value,10);if(e.type==="product"){const u=e.texts&&e.texts.product&&e.texts.product.openButtonTextStart?e.texts.product.openButtonTextStart:k.calc.product.openButtonTextStart,H=e.texts&&e.texts.product&&e.texts.product.openButtonTextEnd?e.texts.product.openButtonTextEnd:k.calc.product.openButtonTextEnd,{percentage:N}=i(t,".op-keti__sum-button.selected").dataset,W=N===h;i(t,".op-keti__btn-open").innerHTML=`${u} ${W?"alk.":"esim."} <span class=op-keti__btn-open__sum>0,00</span> €/kk ${H}`}const p=i(t,".op-keti__sum-button.selected"),l=parseInt(p.dataset.payback,10),d=parseFloat(p.dataset.percentage),x=[...p.parentElement.children].indexOf(p);i(t,".op-keti__input-payback").value=x,i(t,".op-keti__amount_payload").value=`.haarta.4_${r}-${(d*10).toFixed(0)}..site.partner.mn_sl_hark_widget.self`;const g=new URLSearchParams({amount:r,monthly_payment_percentage:d});e.campaignId&&g.set("campaign_id",e.campaignId),s&&s.abort(),s=new AbortController;let E;try{E=await fetch(`${e.calcUrl}?${g}`,{signal:s.signal})}catch(u){if(u.name==="AbortError")return;throw u}const f=await E.json(),y={realInterest:f.effectiveAnnualInterestRate,months:f.paymentMonths,totalPayment:f.totalPayment},b=Math.floor(y.months/12),$=y.months%12;i(t,".op-keti__result")&&(i(t,".op-keti__result").textContent=$===0?`${b}v`:`${b}v ${$}kk`),e.type==="product"&&(i(t,".op-keti__result-overall")&&(i(t,".op-keti__result-overall").textContent=`${y.totalPayment.toFixed(2).replace(".",",")} €`),i(t,".op-keti__result-realinterest")&&(i(t,".op-keti__result-realinterest").textContent=`${y.realInterest.toFixed(2).replace(".",",")} %`),i(t,".op-keti__btn-open__sum").textContent=l.toFixed(2).replace(/\./,",")),i(t,".op-keti__result-payback")&&(i(t,".op-keti__result-payback").textContent=`${l} € / kk`),a.content&&(i(t,'input[type="range"]').value=r,document.querySelectorAll("input[type=range]").forEach(u=>{u.style.setProperty("--value",u.value),u.style.setProperty("--min",u.min===""?"0":u.min),u.style.setProperty("--max",u.max===""?"100":u.max),u.addEventListener("input",()=>u.style.setProperty("--value",u.value))}))}),a.content&&i(t,'input[type="range"]').addEventListener("change",o=>{i(t,".op-keti__input-amount").value=o.currentTarget.value,m(i(t,".op-keti__input-amount"),"change")}),m(i(t,".op-keti__input-amount"),"change")}let L,C=0;function X(t){document.readyState==="interactive"||document.readyState==="complete"?t("params"):document.addEventListener("DOMContentLoaded",t.bind(null,"params"))}function q(t,e){const a=[];return t!==void 0&&a.push(`business_id=${t}`),e!==void 0&&a.push(`campaign_id=${e}`),a.length===0?"":`?${a.join("&")}`}function S(){if(!window.fetch)return!1;const t="https://hae.rahoitus.op.fi",e=Object.assign(window.__opCalcAccount||{},{}),a=Object.assign(window.__opCalcOpts||{},{});if(C>=5)return clearInterval(L),!1;if(!Object.keys(a).length||!Object.keys(e).length)return console.log("Financing calculator: Cannot find options!"),console.log(`Financing calculator: Retrying ${C+1} / 5 ...`),C+=1,L||(L=setInterval(S,5e3)),!1;window.clearInterval(L);const s=q(e.businessId,e.campaignId);return fetch(`${t}/${e.mode}/api/dealers/${e.key}${s}`).then(c=>c.json()).then(c=>{const _=`${t}/${e.mode}/api/dealers/${e.key}/calculation`;Object.keys(a).forEach(o=>{let n=a[o];if(n={details:c,calcUrl:_,campaignId:e.campaignId,...n},document.querySelector(`.op-keti__${n.type}`))return!1;try{const r=document,p="op-keti--opened",l={product:"op-keti__fixed",content:"op-keti--opened"},d=v("div",{className:`op-keti__widget op-keti__type--${n.type} op-keti__type--${n.isSolo===!0||n.details.percentages.length===1?"solo":"multi"} ${l[n.type]}`}),x=v("div",{className:"op-keti__container"}),g=v("button",{classList:"op-keti__btn-open"}),E=v("button",{className:"op-keti__btn-close",textContent:"×"});x.appendChild(E),x.insertAdjacentHTML("beforeend",K(n,e.mode)),d.appendChild(g),d.appendChild(x);const f=r.querySelector(n.selector?n.selector:`#op-keti-init-${n.type}`);if(!f)return console.warn(`Financing calculator: Selector ${n.selector?n.selector:`#op-keti-init-${n.type}`} does not exist!`),!1;f.insertAdjacentElement("afterend",d);const y=(b,$)=>{b.classList.contains($)?b.classList.remove($):b.classList.add($)};g.addEventListener("click",()=>{y(d,p)}),E.addEventListener("click",()=>{y(d,p)}),window.__opCalcWidget=window.__opCalcWidget?window.__opCalcWidget:{},window.__opCalcWidget[n.type]=new R(d,n)}catch(r){const p=document.querySelector(`#op-keti-init-${n.type}`);p&&p.remove(),console.error(r)}})}),!0}X(t=>{setTimeout(()=>{S()},10)})})();
