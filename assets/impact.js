fetch("./data/snapshot.json",{cache:"no-store"}).then(response=>response.json()).then(data=>{
  const stocks=new Map(data.core_stocks.map(row=>[String(row.stock_id),row]));
  const pct=value=>value==null?"尚無完整資料":`${Number(value)>=0?"+":""}${(Number(value)*100).toFixed(2)}%`;
  const money=value=>{const n=Number(value||0),a=Math.abs(n);return`${n>=0?"+":"−"}${a>=1e8?(a/1e8).toFixed(2)+" 億":a>=1e4?(a/1e4).toFixed(1)+" 萬":Math.round(a).toLocaleString()}`};
  const eventRow=event=>`<tr><td>${event.date}</td><td><span class="event ${event.net_amount>=0?"add":"reduce"}">${event.action}</span></td><td class="${event.net_amount>=0?"up":"down"}">${money(event.net_amount)}</td><td>${pct(event.forward_return_1)}</td><td>${pct(event.forward_return_5)}</td><td>${pct(event.forward_return_10)}</td></tr>`;
  function enhance(){
    document.querySelectorAll(".stock").forEach(card=>{
      if(card.querySelector(".impact-toggle"))return;
      const id=card.querySelector(".stock-title small")?.textContent.trim(),row=stocks.get(id);
      if(!row)return;
      const events=row.significant_events||[];
      const panel=document.createElement("div");panel.className="impact-detail";panel.hidden=true;
      panel.innerHTML=`<div class="impact-summary"><span><small>本波建倉時間</small><b>${row.position_start_date||"資料不足"}</b></span><span><small>行為影響力</small><b>${row.impact_label}</b></span><span><small>方向吻合率</small><b>${row.impact_hit_rate==null?"待累積":Math.round(row.impact_hit_rate*100)+"%"}</b></span><span><small>有效事件樣本</small><b>${row.impact_sample_count||0} 次</b></span></div>${events.length?`<div class="impact-table-wrap"><table><thead><tr><th>日期</th><th>動作</th><th>淨額</th><th>後 1 日</th><th>後 5 日</th><th>後 10 日</th></tr></thead><tbody>${events.map(eventRow).join("")}</tbody></table></div>`:`<p class="impact-empty">本波段尚無達重大門檻的加減碼事件。</p>`}<p class="impact-note">重大事件門檻為單日淨額至少 20 日承諾門檻的 25%；方向吻合指加碼後上漲、減碼後下跌。這是行為影響，不代表能控制股價。</p>`;
      const button=document.createElement("button");button.type="button";button.className="impact-toggle";button.textContent="建倉與影響分析";button.setAttribute("aria-expanded","false");
      button.onclick=()=>{const open=panel.hidden;panel.hidden=!open;button.setAttribute("aria-expanded",String(open));button.textContent=open?"收合影響分析":"建倉與影響分析"};
      card.querySelector(".stock-main").append(button,panel);
    });
  }
  new MutationObserver(enhance).observe(document.querySelector("#core-list"),{childList:true});enhance();
});
