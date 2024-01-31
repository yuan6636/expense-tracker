# 家庭記帳本

1. 使用前，請先在專案註冊帳號、密碼，帳號以信箱為主，若不想註冊帳號，也可以使用 Gmail 的方式登入專案
  
2. 此專案可以讓使用者紀錄自己的支出，也可以對支出進行新增、修改、刪除的操作，在新增支出的部分可以把支出分類，之後，在瀏覽支出清單時，除了能瀏覽所有支出清單，也能依照不同分類瀏覽支出清單

## 產品功能

1. 使用者可以註冊帳號<br>
  (1). 註冊後可以登入/登出<br>
  (2). 只有登入後的使用者可以看到專案內容，否則會被導入登入頁  
2. 使用者可以使用 `google` 信箱登入服務，登入並通過驗證後。即可進入專案
3. 登入專案後，使用者可以瀏覽自己建立的支出清單及支出總額，透過點擊最下方的分頁器，顯示不同頁數的支出
4. 進入支出清單頁，使用者可以使用類別的下拉式選單選擇不同類別，並顯示不同類別的支出總額
5. 點擊支出清單的 `新增支出` 按鈕，可以新增一筆支出
6. 點擊單筆支出的 `修改` 按鈕，可以修改支出內容
7. 點擊單筆支出的 `刪除` 按鈕，可以刪除該筆支出


## 開發環境

- [Windows](https://www.microsoft.com/zh-tw/windows/windows-11)
- [Node.js v18.15.0](https://nodejs.org/en)
- [MySQL v8.0.15](https://downloads.mysql.com/archives/installer/)

## 安裝流程

1. 打開終端機，輸入 `git clone` ，將專案存放到電腦。

```
$ git clone https://github.com/yuan6636/expense-tracker.git
```

2. 進入專案資料夾 `expense-tracker`

```
$ cd expense-tracker
```

3. 安裝 `npm` 套件管理器

```
$ npm install
```

4. 安裝 `MySQL` `v8.0.15` (包含 `server` 和 `workbench` )


5. 確認 `config.json` 的 `password` 與 `database` 設定

```
"development": {
    "username": "root",
    "password": "password",
    "database": "record",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
```

6. 建置資料庫
   
```
$ npx sequelize db:create
$ npx sequelize db:migrate
$ npm run seed
```

7. 打開 [Google API Console](https://console.developers.google.com/)，若沒有專案，點擊 `建立` 按鈕，建立專案名稱

8. 設定 `OAuth 同意畫面`，點擊左側 OAuth 同意畫面，選擇`外部`，建立後，填寫必填欄位
   
9. 點擊左側`建立憑證`，再點擊上方`建立憑證`，選擇 `OAuth用戶端ID `，應用程式類型選擇`網頁應用程式`，名稱可以使用預設值，`在已授權的JavaScript來源`加上 http://localhost:3000、`已授權重新導向的URI` 加上 http://localhost:3000/oauth2/redirect/google (`Gmail` 登入後重新導向路由)，最後儲存

10. 建立成功就會取得用戶端編號(`GOOGLE_CLIENT_ID`)和用戶端密鑰(`GOOGLE_CLIENT_SECRET`)，詳細設定`google OAuth`內容可以參考[教學網址](https://xenby.com/b/245-%E6%95%99%E5%AD%B8-google-oauth-2-0-%E7%94%B3%E8%AB%8B%E8%88%87%E4%BD%BF%E7%94%A8%E6%8C%87%E5%8D%97)

11. 在 git bash 輸入以下指令，建立`.env`檔案，並將`.env.example`的內容複製到`.env`檔案，將上一步取得的`GOOGLE_CLIENT_ID`和`GOOGLE_CLIENT_SECRET`一起填入，即可使用`google OAuth`服務

```
touch .env
```
   
12. 執行 `app.js`

```
$ npm run dev
```

10. 終端機顯示下列訊息，表示`server`成功啟動

```
App is running on localhost:3000
```

11. 在瀏覽器輸入網址 `http://localhost:3000`，瀏覽專案

12. 若要關閉 `server` ，可以在終端機輸入 `ctrl + C`

## 專案畫面

![登入](https://github.com/yuan6636/expense-tracker/blob/main/public/img/login.jpg)
![支出清單](https://github.com/yuan6636/expense-tracker/blob/main/public/img/list.jpg)
![新增支出](https://github.com/yuan6636/expense-tracker/blob/main/public/img/create.jpg)
![註冊](https://github.com/yuan6636/expense-tracker/blob/main/public/img/register.jpg)

## 使用的工具

1. [Visual Studio Code](https://code.visualstudio.com/)：程式編輯器
2. [Node v18.15.0](https://nodejs.org/en)：執行環境
3. [express v4.18.2](https://www.npmjs.com/package/express)：Web 應用程式框架
4. [express-handlebars v7.1.2](https://github.com/express-handlebars/express-handlebars)：樣板引擎
5. [nodemon v3.0.1](https://www.npmjs.com/package/nodemon)：Node 輔助工具
6. [method-override v3.0.0](https://www.npmjs.com/package/method-override)：轉換 HTTP 方法的工具
7. [mysql2 v3.2.0](https://www.npmjs.com/package/mysql2)：MySQL client
8. [sequelize v6.30.0](https://sequelize.org/docs/v6/)：Node.js ORM 工具
9. [sequelize-cli v6.6.0](https://www.npmjs.com/package/sequelize-cli)：Sequelize 指令
10. [express-session v1.17.3](https://www.npmjs.com/package/express-session)：express middleware
11. [connect-flash v0.1.1](https://www.npmjs.com/package/connect-flash)：express middleware
12. [dotenv v16.3.1](https://www.npmjs.com/package/dotenv/v/16.3.1)：讀取 .env 文件環境變數設置的模組
13. [bcryptjs v2.4.3](https://www.npmjs.com/package/bcryptjs)：密碼加密套件
14. [passport v0.7.0](https://www.passportjs.org/)：使用者認證套件
15. [passport-google-oauth2 v0.2.0](https://www.passportjs.org/packages/passport-google-oauth2/)：google OAuth
16. [passport-local v1.0.0](https://www.passportjs.org/packages/passport-local/)：passport 本地認證套件
17. [dayjs v1.11.10](https://day.js.org/docs/en/installation/installation)：JavaScript 處理時間的 library

### 參與者

開發者：[yuan6636](https://github.com/yuan6636)