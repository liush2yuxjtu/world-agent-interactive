const modal=document.querySelector('#product-video');
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function open(title,content){
 modal.innerHTML=`<button class="wa-modal-close" data-action="close" aria-label="关闭">×</button><h2>${title}</h2>${content}`;
 if(!modal.open)modal.showModal();
}
document.addEventListener('click',event=>{
 const target=event.target.closest('button,a');if(!target)return;
 const action=target.dataset.action;
 const stop=()=>{event.preventDefault();event.stopImmediatePropagation();};
 if(action==='login'){stop();open('进入演示工作台','<p>公开演示无需密码。当前数据为示例，不连接真实账户。</p><a class="wa-button wa-button--primary" href="app/">以演示身份进入 →</a>');}
 if(action==='contact'){stop();open('联系我们','<p>此表单仅生成本机联系草稿，不会发送邮件。</p><form id="contact-draft"><label>称呼<input name="name" required maxlength="80" autocomplete="name"></label><label>邮箱<input name="email" type="email" required autocomplete="email"></label><label>需求<textarea name="message" required maxlength="2000"></textarea></label><button class="wa-button wa-button--primary">生成联系草稿</button></form>');}
 if(action==='video'){stop();open('World Agent 产品导览','<p>互动导览，非已录制视频。选择一个步骤了解实验流程。</p><div class="walkthrough-tabs"><button data-tour="0">1 · 定义产品</button><button data-tour="1">2 · 比较方案</button><button data-tour="2">3 · 检查证据</button></div><div class="tour-body"><h3>定义产品与消费者</h3><p>填写产品、目标人群与市场环境，建立可重复的实验设置。</p></div><a class="wa-button wa-button--primary" href="app/">打开交互实验 →</a>');}
 if(target.dataset.tour!==undefined){stop();const copy=[['定义产品与消费者','填写产品、目标人群与市场环境，建立可重复的实验设置。'],['并行比较三个方案','调整价格、渠道与信息表达，切换方案查看示例结果。'],['检查结果与证据','比较销量、转化、复购与 ROI，导出明确标注的示例报告。']][Number(target.dataset.tour)];modal.querySelector('.tour-body').innerHTML=`<h3>${copy[0]}</h3><p>${copy[1]}</p>`;}
 if(target.getAttribute('href')==='#technology'){stop();open('技术优势','<h3>真实数据校准</h3><p>区分观察、推断与仿真数据，保留来源。</p><h3>方案并行对比</h3><p>在相同条件下比较产品、价格和渠道。</p><h3>证据可以复查</h3><p>从结论回看消费者行为与影响路径。当前页面仅展示未经校准的示例。</p>');}
},true);
document.addEventListener('submit',event=>{
 if(event.target.id!=='contact-draft')return;event.preventDefault();const values=new FormData(event.target);
 open('联系草稿',`<p>草稿已生成，尚未发送。</p><textarea class="contact-preview" readonly>${esc(`称呼：${values.get('name')}\n邮箱：${values.get('email')}\n需求：${values.get('message')}`)}</textarea><button class="wa-button wa-button--secondary" data-action="close">关闭</button>`);
});
