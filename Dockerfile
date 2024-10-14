# 選擇 Node.js 基礎映像檔
FROM node:18-alpine

# 設置工作目錄，WORKDIR 是 Dockerfile 指令，用來設置在容器內部儲存應用程式檔案的目錄
WORKDIR /usr/src/app

COPY package*.json ./

# 安裝套件
# RUN 指令用在映像檔建構階段執行的指令，並建立新的層。每個 RUN 指令都會在當前映像檔的頂部創建一個新的層並提交更改，進而形成新的映像檔
RUN npm install

# 當前目錄複製到 docker 目錄
COPY . .

# 暴露應用程式使用的端口
EXPOSE 3000

# 啟動應用程式
# CMD 是指定一個容器啟動時需要執行的命令，每個 Dockerfile 只能包含一個 CMD 指令
CMD ["npm", "start"]