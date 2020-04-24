<template>
  <div id="pageId" class="q-layout-page layout-padding">

    <div class="relative-position q-mb-lg backend-page">
      <div class="box" v-if="success">
        <!--Form-->
        <q-form autocorrect="off" autocomplete="off" ref="formContent" class="full-width q-my-sm"
                @submit="itemId?updateItem():createItem()" @validation-error="$alert.error($tr('ui.message.formInvalid'))">
          <!--name-->
          <q-input v-model="form.name" outlined dense
                   :rules="[val => !!val || $tr('ui.message.fieldRequired')]"
                   :label="`${$tr('ui.form.name')}`"/>
          <!--url-->
          <q-input v-model="form.url" outlined dense
                   :rules="[val => !!val || $tr('ui.message.fieldRequired')]"
                   :label="`${$tr('qfeed.layout.form.url')}`" @blur="getRSSOptions"/>

          <q-select outlined dense bg-color="white" v-model="form.type"
                    :label="`${$tr('ui.form.type')}*`"
                    emit-value map-options
                    option-label="name"
                    option-value="id"
                    :options="optionsType"
          />

          <q-select outlined dense bg-color="white" v-model="form.status"
                    :label="`${$tr('ui.form.status')}*`"
                    emit-value map-options
                    option-label="name"
                    option-value="id"
                    :options="optionsStatus"
          />
          <crud
                  type="select"
                  v-model="form.userId"
                  :crudData="import('@imagina/quser/_crud/users')"
                  :crudProps="{
                    label: `${this.$tr('ui.form.author')}*`,
                    rules: [
                      val => !!val || this.$tr('ui.message.fieldRequired')
                    ],
                  }"
                  :config="{
                    options: {label: 'fullName', value: 'id'},
                  }"
                  v-if="checkAdminProfile"
          />
          <div class="row q-col-gutter-md">
              <div class="col-12 q-py-md text-h6">
                {{ $tr('qfeed.layout.form.options') }}
              </div>
              <div :class="'col-12'+(Object.keys(option).length === 0?' col-sm-3':'')" v-for="(option,key) in defaultOptions">
                <div v-if="Object.keys(option).length === 0">

                    <q-select outlined dense bg-color="white" v-model="form.options[key]"
                        :label="key"
                        emit-value map-options
                        :options="optionsElements"
                    />
                </div>
                <div class="row" v-else>
                  <div class="col-12 q-pb-sm">
                    {{ key }}
                  </div>
                  <div class="col-12 col-md-3 q-px-md" v-for="(element,key2) in option">
                    <q-select outlined dense bg-color="white"
                      :label="key2"
                      emit-value map-options
                      :options="optionsElements"
                      v-model="form.options[key][key2]"
                    />
                  </div>
                </div>
              </div>
          </div>
          <q-page-sticky
                  position="bottom-right"
                  :offset="[18, 18]">
            <!--Update button-->
            <q-btn v-if="$route.params.id" color="positive" :loading="loading"
                   icon="fas fa-edit" :label="$tr('ui.label.update')" type="submit"/>
            <!--Save button-->
            <q-btn v-else color="positive" :loading="loading" icon="fas fa-edit"
                   :label="$tr('ui.label.create')" type="submit"/>
          </q-page-sticky>
        </q-form>
      </div>
      <inner-loading :visible="loading"/>
    </div>
  </div>
</template>

<script>

  export default {
    name: 'qfeed-form',
    components: {
    },
    watch: {
      $route(to, from) {
        this.initForm()
      }
    },
    mounted() {
      this.$nextTick(function () {
        this.initForm()
      })
    },
    data() {
      return {
        form:{
          name: '',
          url: '',
          type: 0,
          status: 1,
          userId: parseInt(this.$store.state.quserAuth.userId),
          options: {
            title: "",
            description: "",
            slug: "",
            createdAt: "",
            mainImage: "",
            item:{
              title: "",
              description: "",
              slug: "",
              createdAt: "",
              mainImage: "",
            }
          }
        },
        defaultOptions: {
          title: "",
          description: "",
          slug: "",
          createdAt: "",
          mainImage: "",
          item:{
            title: "",
            description: "",
            slug: "",
            createdAt: "",
            mainImage: "",
          }
      },
        rssReturns: {},
        loading: false,
        success: false,
        itemId: false,
        optionsType: [],
        optionsStatus: [],
        optionsElements: [
        ]
      }
    },
    computed: {
      checkAdminProfile(){
        let adminProfile = false
        let roles = this.$store.state.quserAuth.roles.foreach(item =>{
          if(item.slug==='admin'){
            adminProfile = true
          }
        })
        return adminProfile
      }
    },
    methods: {
      async initForm() {
        this.loading = true
        this.success = false
        this.itemId = this.$route.params.id
        await this.filterOptionsType()
        await this.filterOptionsStatus()
        await this.getData()
        this.success = true
        this.loading = false
      },
      getData() {
        return new Promise((resolve, reject) => {
          const itemId = this.$clone(this.itemId)
          if (itemId) {
            let configName = 'apiRoutes.qfeed.sources'
            //Params
            let params = {
              refresh: true,
              params: {
                filter: {allTranslations: true}
              }
            }
            //Request
            this.$crud.show(configName, itemId, params).then(response => {
                Object.assign(this.form, { ...response.data })
                this.getRSSOptions()
                setTimeout(()=>{
                  this.form.type = parseInt(response.data.type)
                  this.form.status = parseInt(response.data.status)
                  this.form.userId = parseInt(response.data.userId)
                },500)
                this.loading = false
              resolve(true)//Resolve
            }).catch(error => {
              this.$alert.error({message: this.$tr('ui.message.errorRequest'), pos: 'bottom'})
              this.loading = false
              reject(false)//Resolve
            })
          } else {
            resolve(true)//Resolve
          }
        })
      },
      getRSSOptions(){
        this.loading = true
        let configName = 'apiRoutes.qfeed.feeds'
        //Params
        let params = {
          refresh: true,
          params: {
            filter: {source: this.form.url}
          }
        }
        //Request
        this.$crud.index(configName, params).then(response => {
          this.rssReturns = response.data
          this.optionsElements = []
          this.recursiveElements(response.data,null)
          this.loading = false
        }).catch(error=>{
          console.error(error)
          this.loading = false
        })
      },
      recursiveElements(element,parent=null){
        if(Array.isArray(element)){
          this.recursiveElements(element[0],parent)
          return;
        }
        for(let key in element){
          if (parent == null) {
            this.optionsElements.push({label: key, value: key})
          } else {
            this.optionsElements.push({label: parent + key, value: parent + key})
          }
          if(typeof element[key] === 'object'){
            this.recursiveElements(element[key],key)
          }
        }
      },
      async updateItem() {
          this.loading = true
          let configName = 'apiRoutes.qfeed.sources'
          this.$crud.update(configName, this.itemId, this.form).then(response => {
            this.$alert.success({message: `${this.$tr('ui.message.recordUpdated')}`})
            this.$router.push({name: 'qfeed.admin.sources.edit',params:{id: this.itemId}})
            //this.initForm()
            this.loading = false
          }).catch(error => {
            this.loading = false
            this.$alert.error({message: this.$tr('ui.message.recordNoUpdated'), pos: 'bottom'})
          })
      },
      async createItem() {
          this.loading = true
          let configName = 'apiRoutes.qfeed.sources'
          this.$crud.create(configName, this.form).then(response => {
            this.$alert.success({message: `${this.$tr('ui.message.recordCreated')}`})
            this.$router.push({name: 'qfeed.admin.sources'})
            //this.initForm()
            this.loading = false
          }).catch(error => {
            this.loading = false
            this.$alert.error({message: this.$tr('ui.message.recordNoUpdated'), pos: 'bottom'})
          })
      },
      async filterOptionsType(){
        let configName = 'apiRoutes.qfeed.types'
        await this.$crud.index(configName).then(response => {
          this.optionsType = response.data
        })
      },
      async filterOptionsStatus(){
        let configName = 'apiRoutes.qfeed.statuses'
        await this.$crud.index(configName).then(response => {
          this.optionsStatus = response.data
        })
      },
    }
  }
</script>

<style scoped>

</style>
