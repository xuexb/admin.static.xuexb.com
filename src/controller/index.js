const path = require('path');
const fs = require('fs');
const Base = require('./base.js');

module.exports = class extends Base {

    /**
     * 获取静态文件路径
     *
     * @param  {string} filename 文件名
     *
     * @return {string}
     */
    getFilePath(filename) {
        return this.config('htmlDir') + path.sep + filename.replace(/\.\./g, '');
    }

    /**
     * 首页
     *
     * @return {Object}
     */
    async indexAction() {
        let items = [];

        try {
            items = fs.readdirSync(this.config('htmlDir')).filter(name => name.substr(0, 1) !== '.');
        }
        catch (e) {}

        items = items.map(filename => {
            return {
                filename,
                url: `/html/${filename}`,
                mip: `http://admin-static-xuexb-com.mipcdn.com/c/s/admin.static.xuexb.com/html/${filename}`
            };
        });

        this.assign({
            items
        });

        return this.display();
    }

    /**
     * 编辑
     *
     * @param {string} filename 文件名
     * @return {Object}
     */
    async deleteAction() {
        const filename = this.get('filename');
        const filepath = this.getFilePath(filename);
        if (think.isFile(filepath)) {
            fs.unlinkSync(filepath);
        }
        return this.showMsg('删除成功', '/');
    }

    /**
     * 编辑
     *
     * @param {string} filename 文件名
     * @param {string} content 文件内容
     * @return {Object}
     */
    async editorAction() {
        if (this.isPost) {
            const {filename, content} = this.post();
            const filepath = this.getFilePath(filename);
            fs.writeFileSync(filepath, content);
            return this.showMsg('保存成功', '/');
        }

        const filename = String(this.get('filename') || '').replace(/\.\./g, '');
        const isEditor = !!filename;
        const filepath = isEditor ? this.getFilePath(filename) : path.join(think.ROOT_PATH, 'view/default.html');

        if (!think.isFile(filepath)) {
            return this.showMsg({
                text: isEditor ? '文件不存在' : '新增文件出错',
                type: 'danger'
            }, '/');
        }

        const content = fs.readFileSync(filepath).toString();

        this.assign({
            filename: filename || think.md5(Date.now()).substr(0, 6) + '.html',
            content,
            isEditor
        });

        return this.display();
    }
};
