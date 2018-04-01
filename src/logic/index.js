const Base = require('./base.js');

module.exports = class extends Base {
    editorAction() {
        if (this.isPost) {
            const rules = {
                filename: {
                    required: true
                },
                content: {
                    required: true
                }
            };

            if (!this.validate(rules)) {
                return this.showMsg();
            }
        }
    }

    deleteAction() {
        const rules = {
            filename: {
                required: true
            }
        };

        if (!this.validate(rules)) {
            return this.showMsg();
        }
    }

    loginAction() {
        if (!this.isPost) {
            return;
        }
        const rules = {
            token: {
                required: true
            }
        };

        if (!this.validate(rules)) {
            return this.showMsg();
        }
    }
};
