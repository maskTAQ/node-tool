const fs = require('fs');

const arg = process
    .argv
    .splice(2);
const config = {
    input: '', //入口文件
    output: '', //出口文件
    watch: false, //是否监听文件的改变
    jsx: 'react-native', // ['react','react-native']
    stylesName: '12styles' //样式的变量名
};

class ClassNameCompile {
    constructor(config) {
        Object.assign(this, config);
    }
    readFile(filename) {
        return new Promise((resolve, reject) => {
            fs.readFile(filename, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }

            });
        })
    }
    writeFile(filename, data) {
        return new Promise((resolve, reject) => {
            fs.writeFile(filename, data, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }
    createClassName(classNames) {
        const {jsx, stylesName} = config;
        const classNamesArr = classNames.split(/\s+/);
        const className = jsx === 'react'
            ? 'className'
            : 'style';

        //处理class只有一个的情况;
        if (classNamesArr.length === 1) {
            if (classNamesArr[0].includes('-')) {
                return `${className}={${stylesName}['${classNamesArr[0]}']}`
            }
            return `${className}={${stylesName}.${classNamesArr[0]}}`
        } else {
            const jsxTypeHandleMap = {
                react() {
                    let result = classNamesArr.map(className => {
                        if (className.includes('-')) {
                            return `\${${stylesName}['${className}']}`
                        }
                        return `\${${stylesName}.${className}}`
                    });
                    return `${className}={\`${result.join(' ')}\`}`
                },
                'react-native' () {
                    let result = classNamesArr.map(className => {
                        if (className.includes('-')) {
                            return `${stylesName}['${className}']`
                        }
                        return `${stylesName}.${className}`
                    });
                    return `${className}={[${result}]}`
                }
            };

           return jsxTypeHandleMap[jsx];

        }
    }
    replace(data) {
        const reg = /className="([A-z-\s]+)"/; //匹配className的值替换成变量
        let processedStr = '', //已处理的字符串
            undisposedStr = data, //未处理的字符串
            resultStr = ''; //处理后的结果字符串

        const replaceOneStr = () => {
            //匹配未处理的字符串 看是否有需要替换的className值
            const result = reg.exec(undisposedStr);
            if (result) {
                const i = result.index,
                    className = result[1],
                    splitIndex = i + 'className=""'.length + className.length;

                processedStr = undisposedStr.substring(0, splitIndex);
                undisposedStr = undisposedStr.substring(splitIndex, undisposedStr.length);
                resultStr += processedStr.replace(reg, this.createClassName(className));
                replaceOneStr();
            } else {
                //如果未匹配到 className 就讲剩余未处理的字符串拼接到结果中
                resultStr += undisposedStr;
            }

        }
        replaceOneStr();
        return resultStr;

    }
    watchFile(path) {
        return fs.watch(path);
    }
    start() {
        const {input, output, watch} = this;
        if (watch) {
            this
                .watchFile(input)
                .on('change', (err, filename) => {
                    this
                        .readFile(input)
                        .then((res => {
                            return this.writeFile(output, this.replace(res.toString()))
                        }))
                        .then(() => {
                            console.log(`编译成功`);
                        })
                        .catch(e => {
                            console.log(`编译失败 error:${e}`);
                        });
                });
            console.log(`监听文件中...`);
        } else {
            this
                .readFile(input)
                .then((res => {
                    return this.writeFile(output, this.replace(res.toString()))
                }))
                .then(() => {
                    console.log(`编译成功`);
                })
                .catch(e => {
                    console.log(`编译失败 error:${e}`);
                })
        }

    }
}

const setConfig = () => {
    arg.forEach(item => {
        const [key,
            value] = item.split('=');
        if (item.includes(':')) {
            const [input,
                output] = item.split(':');
            Object.assign(config, {input, output});

        } else if (item.includes('--watch')) {
            config.watch = true;
        } else {
            config[key] = value;
        }
    });
    return Promise.resolve('完成参数配置');
}

setConfig().then(() => {
    const c = new ClassNameCompile(config);
    c.start();
})
