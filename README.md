## Jerrysbox网站活动
### 活动链接: https://jerrysbox.xyz/
### 使用方法
1. clone本仓库 `git clone https://github.com/zhou479/jerrysbox_submit.git`
2. 新建config文件夹
3. 在`generate_params.js`文件中，添加白名单钱包助记词和该助记词下有白名单地址数量.
4. `注意看看钱包地址是bc1q开头还是bc1p开头`
5. 执行 `node generate_params.js` 生成提交所需参数
6. 执行 `node index.js` 完成提交