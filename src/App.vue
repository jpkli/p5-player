<template>
  <v-app id="app">
    <v-toolbar app dense fixed clipped-left>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title class="app-title">P.Play</v-toolbar-title>
        <v-btn flat>
          Documentation
        </v-btn>
        <v-btn flat>
          Examples
        </v-btn>
        <v-spacer></v-spacer>
        <v-menu bottom left>
          <v-btn
            slot="activator"
            icon
          >
            <v-icon>more_vert</v-icon>
          </v-btn>
          <v-list>
            <v-list-tile>
              <v-list-tile-title @click.stop="drawer = !drawer">Data Sets</v-list-tile-title>
            </v-list-tile>
            <v-list-tile>
              <v-list-tile-title>Visualizations</v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-menu>
    </v-toolbar>
    <v-content>
      <v-container fluid fill-height class="pa-1">
          <v-layout fill-height id="p-play-sidebar">
          </v-layout>
          <v-layout fill-height style="padding-top: 5px" id="p-play-spec">
          </v-layout>
          <v-layout fill-height id="p-play-vis">
            <v-flex fill-height class="pa-0">
              <v-toolbar flat dense style="border-bottom: 1px solid #aaa">
                  <v-btn color="primary" @click="run()">
                    <v-icon class="btn-icon">play_circle_outline</v-icon>
                    Run
                  </v-btn>
                  <v-btn color="primary" @click="run()">
                    <v-icon class="btn-icon">save</v-icon>
                    Save
                  </v-btn>
                  <v-spacer></v-spacer>
              </v-toolbar>
              <v-flex class="pa-2" id="p-play-vis-canvas">

              </v-flex>
              <StartPage></StartPage>
            </v-flex>
          </v-layout>
      </v-container>
    </v-content>
    <v-footer app fixed>
      <v-layout justify-center>
        <span>&copy; 2018</span>
      </v-layout>
    </v-footer>
  </v-app>
</template>

<script>
import StartPage from './StartPage'
import Split from 'split.js'
import ace from 'ace-builds'
import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/webpack-resolver'
// import 'ace-builds/src-noconflict/ext-language_tools'
import p4 from 'p.4'
import { randomJSONs } from 'p4/test/utils'
import spec from '../examples/BarChart.json'

export default {
  name: 'App',
  data: () => ({
    drawer: false
  }),
  props: {
    layout: null,
    editor: null,
    processor: null
  },
  components: {
    StartPage
  },
  mounted: () => {
    this.layout = Split(['#p-play-sidebar', '#p-play-spec', '#p-play-vis'], {
      sizes: [0, 45, 55],
      gutterSize: 3,
      onDrag: () => {
        this.editor.resize()
      }
    })

    let dataProps = [
      {name: 'Gender', dtype: 'string', values: ['F', 'M']},
      {name: 'Weight', dtype: 'float', dist: 'normal', min: 2, max: 20, mean: 7, std: 2},
      {name: 'MotherWeight', dtype: 'float', dist: 'normal', min: 50, max: 290, mean: 100, std: 50},
      {name: 'MotherRace', dtype: 'string', values: ['White', 'Asian', 'Black', 'Mixed']},
      {name: 'MotherAge', dtype: 'int', dist: 'normal', min: 16, max: 70, mean: 40, std: 25}
    ]

    let schema = {}
    for (let prop of dataProps) {
      schema[prop.name] = prop.dtype
    }

    let data = randomJSONs({props: dataProps, size: 1000})

    let db = p4.cstore()
    db.import({
      data: data,
      schema: schema
    })
    console.log(JSON.stringify(spec))

    this.processor = p4({
      container: 'p-play-vis-canvas',
      viewport: [800, 500],
      data: db.data()
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
  },
  methods: {
    run: () => {
      let spec = this.editor.getValue()
      console.log('execute', spec)
    }
  }
}
</script>

<style>
.v-btn {
  text-transform: none;
}

.split {
    -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
            box-sizing: border-box;
    overflow-y: auto;
    overflow-x: hidden;
}

.gutter {
    background-color: #eee;
    background-repeat: no-repeat;
    background-position: 50%;
    height: 100%;
}

.gutter.gutter-horizontal {
    cursor: ew-resize;
}

.gutter.gutter-vertical {
    cursor: ns-resize;
}

.app-title {
  color: steelblue;
  font-weight: bolder;
  font-size: 2.22em;
  margin-right: 1em;
}

.btn-icon {
  margin-right: 0.25em;
}

</style>
