// node hackerrankcontest.js --url=https://www.hackerrank.com --config=config.json 

//npm init -y
//npm install minimist
//npm install puppeteer

let minimist = require("minimist");
let pupeteer = require("puppeteer");
let fs = require("fs");
const { cachedDataVersionTag } = require("v8");

let args = minimist(process.argv);

let configJSON = fs.readFileSync(args.config,"utf-8");
let configJSO = JSON.parse(configJSON);

async function run(){
    // open the browser
    let browser = await pupeteer.launch({
        headless : false,
        args : [
            '--start-maximized'
        ],
        defaultViewport: null

    });

    //get the tabs (there is only a single tab)
    let pages = await browser.pages();
    let page = pages[0];

    //now open the url
    await page.goto(args.url);

    //wait and then click on login page1
    await page.waitForSelector("a[data-event-action='Login']");
    await page.click("a[data-event-action='Login']");

    //wait and click on login page 2
    await page.waitForSelector("a[href='https://www.hackerrank.com/login']");
    await page.click("a[href='https://www.hackerrank.com/login']");

    //type userid
    await page.waitForSelector("input[name = 'username']");
    await page.type("input[name = 'username']",configJSO.userid,{delay:20});

    //type password
    await page.waitForSelector("input[name = 'password']");
    await page.type("input[name = 'password']",configJSO.password,{delay:20});

    await page.waitFor(3000);

    //click on login3
    await page.waitForSelector("button[data-analytics='LoginPassword']");
    await page.click("button[data-analytics='LoginPassword']");
    
    //click on compete
    await page.waitForSelector("a[data-analytics='NavBarContests']");
    await page.click("a[data-analytics='NavBarContests']");
     
    // click on manage contests
    await page.waitForSelector("a[href='/administration/contests/']");
    await page.click("a[href='/administration/contests/']");

    //find the no. of pages

    await page.waitForSelector("a[data-attr1='Last']");
    let numpages = await page.$eval("a[data-attr1 ='Last']", function(atag){
        let totpages = parseInt(atag.getAttribute("data-page"));
        return totpages;
    });

    for(let i = 1 ; i<=numpages;i++){
        await handleallcontestsofapage(page,browser);

        if(i!=numpages){
            await page.waitForSelector("a[data-attr1='Right']");
            await page.click("a[data-attr1='Right']");
        }

    }

}
async function handleallcontestsofapage(page,browser){
    await page.waitForSelector("a.backbone.block-center");
    let curls  = await page.$$eval("a.backbone.block-center",function(atags){
        let urls = [];
        for(let i = 0 ; i<atags.length;i++){
            let url = atags[i].getAttribute("href");
    
            urls.push(url);
        }
        return urls;
    });

    for(let i = 0 ; i<curls.length;i++){
        let ctab = await browser .newPage();
        await SaveModInContest(ctab,args.url+curls[i],configJSO.moderator);
        await ctab.close();
        await page.waitFor(3000);
    }

}

async function SaveModInContest(ctab,fullcurl,moderator){
    await ctab.bringToFront();
    await ctab.goto(fullcurl);
    await ctab.waitFor(3000);

    //click on mod tab
    await ctab.waitForSelector("li[data-tab='moderators']");
    await ctab.click("li[data-tab='moderators']");

     // type in moderator
     await ctab.waitForSelector("input#moderator");
     await ctab.type("input#moderator", moderator, { delay: 50 });
     await ctab.waitFor(1000);

 
     // press enter
     await ctab.keyboard.press("Enter");
     await ctab.waitFor(1000);


}

run();