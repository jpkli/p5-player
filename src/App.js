import StartPage from './StartPage'
import Split from 'split.js'
import p5 from 'p5'
import cstore from 'p4/src/cstore'
import Babies from 'p4/test/data-babies'
import spec from '../examples/BarChart.json'

// load markups and editor
import './markups/App.css'
import appTpl from './markups/App.html'
import ace from 'ace-builds'
import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/webpack-resolver'
// import 'ace-builds/src-noconflict/ext-language_tools'

export default {
  name: 'App',
  template: appTpl,
  data: () => ({
    drawer: false,
    layout: null,
    editor: null,
    processor: null
  }),
  methods: {
    simBabyData: function (dataSize) {
      let babies = new Babies(dataSize)
      let db = cstore()
      db.import({
        data: babies.data,
        schema: babies.schema
      })
      return db.data()
    },
    run: function () {
      let spec = JSON.parse(this.editor.getValue())
      console.log(spec)
      this.processor.runSpec(spec.operations)
    },
    progress: function () {
      this.processor.progress(this.simBabyData(1000))
    }
  },
  components: {
    StartPage
  },
  mounted: function () {
    this.layout = Split(['#p-play-sidebar', '#p-play-spec', '#p-play-vis'], {
      sizes: [0, 45, 55],
      gutterSize: 3,
      onDrag: () => {
        this.editor.resize()
      }
    })

    this.processor = p5({
      container: 'p-play-vis-canvas',
      viewport: [800, 500],
      data: this.simBabyData(1000)
    })

    this.processor.view([
      {id: 'test', width: 500, height: 300, padding: {left: 70, right: 10, top: 50, bottom: 60}}
    ])

    let result = this.processor.runSpec(spec.operations).result('row')
    console.log(result)

    // let langTools = ace.require('ace/ext/language_tools')
    let editor = ace.edit('p-play-spec')
    this.editor = editor
    editor.setTheme('ace/theme/chrome')
    editor.getSession().setMode('ace/mode/json')
    editor.getSession().setUseWrapMode(true)
    editor.setOptions({
      tabSize: 2,
      fontSize: '12pt'
      // enableBasicAutocompletion: true,
      // enableLiveAutocompletion: true
    })
    editor.$blockScrolling = Infinity
    editor.setValue(JSON.stringify(spec, null, 2), 1)
  }
}
