/* Browser smoke tests for V4.11. Runs in GitHub Actions with Playwright. */
'use strict';
const { chromium } = require('playwright');
const path=require('node:path');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const staticDir=path.resolve(__dirname,'../static');
const home='file://'+path.join(staticDir,'Viet_Su_Timeline_V4.11_Offline.html');
const exams='file://'+path.join(staticDir,'on-thi/index.html');
const shots=path.resolve(__dirname,'../../v411_screenshots');
fs.mkdirSync(shots,{recursive:true});
(async()=>{
  const browser=await chromium.launch({headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1350,height:850}});
    page.on('dialog',async dialog=>dialog.accept());
    await page.goto(home,{waitUntil:'domcontentloaded',timeout:60000});
    const debug=await page.evaluate(()=>({
      title:document.title,
      textAroundSgk:(document.body.innerText||'').toLowerCase().indexOf('sách giáo khoa'),
      scripts:[...document.scripts].map(x=>x.src).filter(x=>x.includes('v411')),
      navCandidates:[...document.querySelectorAll('nav a,nav button,aside a,aside button,[id^="nav"],[onclick]')].map(x=>({
        tag:x.tagName,id:x.id,cls:String(x.className).slice(0,70),
        text:(x.textContent||'').trim().slice(0,100),onclick:x.getAttribute('onclick')
      })).filter(x=>x.text.toLowerCase().includes('sách')||x.text.toLowerCase().includes('sgk')).slice(0,35),
      exactTexts:[...document.querySelectorAll('span,a,button,div')].filter(x=>x.children.length===0&&(x.textContent||'').toLowerCase().includes('sách giáo khoa')).slice(0,15).map(x=>x.outerHTML.slice(0,450))
    }));
    console.log('UI DEBUG',JSON.stringify(debug));
    await page.screenshot({path:path.join(shots,'00-trang-chu-truoc-kiem-tra.png')});
    await page.waitForSelector('[data-vs-exam-new]',{timeout:8000});
    const found=await page.locator('[data-vs-exam-new]').count();
    assert.ok(found>0,'Must inject exam menu before textbooks');
    const adjacent=await page.locator('[data-vs-exam-new]').first().evaluate(el=>
      (el.nextElementSibling?.textContent||'').toLowerCase().includes('sách giáo khoa'));
    assert.ok(adjacent,'Exam menu must be immediately above Sách giáo khoa');
    console.log('PASS: menu appears before textbooks, count=',found);
    await page.screenshot({path:path.join(shots,'01-menu-desktop.png')});
    await page.goto(exams,{waitUntil:'load'});
    assert.equal(await page.locator('#gradeCards .grade-card').count(),3);
    assert.equal((await page.locator('#available').textContent()).trim(),'33 câu hỏi khả dụng');
    await page.click('#startButton');
    await page.waitForSelector('#quiz:not(.hidden)');
    assert.equal(await page.locator('#questionPane .option').count(),4);
    await page.locator('#questionPane .option').first().click();
    assert.equal(await page.locator('#questionPane .feedback').count(),1,'Study needs immediate feedback');
    await page.screenshot({path:path.join(shots,'02-on-tap-desktop.png')});
    await page.click('#finishButton');
    await page.waitForSelector('#results:not(.hidden)');
    assert.equal(await page.locator('#reviewList .review-item').count(),10);
    const score=await page.locator('#scoreValue').textContent();
    assert.ok(score && parseFloat(score.replace(',','.'))>=0,'Score should render');
    console.log('PASS: study -> feedback -> score -> answers; score:',score);
    await page.click('#newButton');
    await page.click('.grade-card[data-grade="11"]');
    await page.selectOption('#modeSelect','exam');
    await page.click('#startButton');
    await page.waitForSelector('#quiz:not(.hidden)');
    await page.locator('#questionPane .option').first().click();
    assert.equal(await page.locator('#questionPane .feedback').count(),0,'Exam must hide solutions while taking');
    await page.click('#finishButton');
    await page.waitForSelector('#results:not(.hidden)');
    assert.equal(await page.locator('#reviewList .review-item').count(),10);
    console.log('PASS: exam mode hides feedback and produces review at submit');
    const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,deviceScaleFactor:1});
    await mobile.goto(exams,{waitUntil:'load'});
    await mobile.click('.grade-card[data-grade="12"]');
    assert.equal((await mobile.locator('#available').textContent()).trim(),'30 câu hỏi khả dụng');
    await mobile.screenshot({path:path.join(shots,'03-chon-lop-mobile.png')});
    await mobile.click('#startButton');
    assert.equal(await mobile.locator('#questionPane .option').count(),4);
    const over=await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2);
    assert.equal(over,false,'Mobile has horizontal overflow');
    await mobile.screenshot({path:path.join(shots,'04-lam-bai-mobile.png')});
    console.log('PASS: mobile grade 12 and no horizontal overflow');
    await mobile.close();await page.close();
  }finally{await browser.close();}
})().catch(err=>{console.error(err);process.exitCode=1;});
