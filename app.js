const REFERRAL='https://my.tradequo.com/register?referral=019e8e96-5023-7169-93e5-2cd846dbb329';
document.querySelectorAll('[data-referral]').forEach(a=>a.href=REFERRAL);
const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
document.querySelectorAll('[data-video]').forEach(card=>{
  card.addEventListener('click',()=>{
    const id=card.dataset.video,start=card.dataset.start||0;
    card.innerHTML='<iframe width="100%" height="100%" src="https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0&start='+start+'" title="Tutoriel vidéo" frameborder="0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
  });
});
document.querySelectorAll('[data-copy]').forEach(b=>b.addEventListener('click',async()=>{
  const value=b.dataset.copy;
  try{await navigator.clipboard.writeText(value);const old=b.textContent;b.textContent='Copié ✓';setTimeout(()=>b.textContent=old,1400)}catch(e){}
}));
const menu=document.querySelector('.menu'),links=document.querySelector('.links');
if(menu&&links){menu.addEventListener('click',()=>{const open=links.dataset.open==='true';links.dataset.open=String(!open);if(!open){links.style.display='flex';links.style.position='absolute';links.style.right='18px';links.style.top='64px';links.style.flexDirection='column';links.style.alignItems='stretch';links.style.padding='14px';links.style.borderRadius='16px';links.style.background='#fff';links.style.boxShadow='0 18px 50px rgba(0,0,0,.12)'}else{links.removeAttribute('style')}})}
