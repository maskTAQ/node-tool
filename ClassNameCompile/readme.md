>用于处理替换classNmae的小工具
在vscode等一些emmet补全标签的插件中补全的class名为字符串,如果应用了css-modules等css预编译插件或者在react-native中则需要把引用的class名字改为变量，这时候手动替换会很麻烦，所以写了这个小工具自动替换

* 保证你的node版本>8.0

node index [sourceFilename]:[targetFilename] --watch//是否监听文件的改变 jsx=[type]//输入文件类型react或者react-native stylesName=[stylesVariable] //样式对象的变量名

# demo
$ node index source.js:target.js --watch jsx=react stylesName=styles

```javascript
//---source.js
class Demo{
    render() {
        return (
            <View className="testClasss testClass-demo">
                <Text className="testClass">hello masktaq</Text>
            </View>
        )
    }
}
//---target.js
class Demo{
    render() {
        return (
            <View className={`${styles.testClasss} ${styles['testClass-demo}']`}>
                <Text className={styles.testClass}>hello masktaq</Text>
            </View>
        )
    }
}
```

$ node index source.js:target.js --watch jsx=react-native stylesName=styles

```javascript
//---source.js
class Demo{
    render() {
        return (
            <View className="testClasss testClass-demo">
                <Text className="testClass">hello masktaq</Text>
            </View>
        )
    }
}
//---target.js
class Demo{
    render() {
        return (
            <View style={[styles.testClasss ,styles['testClass-demo']]}>
                <Text style={styles.testClass}>hello masktaq</Text>
            </View>
        )
    }
}
```