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
            <!--User-->
            <div class="input-title">{{`${$tr('ui.form.author')}`}}</div>
            <tree-select
                    v-model="form.userId"
                    :async="true"
                    :append-to-body="true"
                    class="q-mb-md"
                    :load-options="searchUsers"
                    :default-options="optionsUsers"
                    placeholder=""
                    label="name"
            />
          <div class="row q-col-gutter-md q-pt-sm">
              <div class="col-12 q-py-sm">
                <div class="text-h6">{{ $tr('qfeed.layout.form.options') }}</div>
                <div>{{ $tr('qfeed.layout.form.source') }}</div>
              </div>
              <div :class="'col-12'+(Object.keys(option).length === 0?' col-sm-3':'')" v-for="(option,key) in defaultOptions.source">
                  <!--User-->
                  <div class="input-title">{{$tr('qfeed.layout.form.sources.'+key)}}</div>
                  <tree-select
                      v-model="form.options.source[key]"
                      :append-to-body="true"
                      :async="true"
                      class="q-mb-md"
                      :default-options="optionsElements"
                      :load-options="searchItems"
                      placeholder=""
                      label="name"
                  />
              </div>
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-12 q-pb-sm">
              {{ $tr('qfeed.layout.form.item') }}
            </div>
            <div class="col-12 col-md-3" v-for="(element,key2) in defaultOptions.item">
                <div class="input-title">{{$tr('qfeed.layout.form.items.'+key2)}}</div>
                <tree-select
                    v-model="form.options.item[key2]"
                    :append-to-body="true"
                    :async="true"
                    class="q-mb-md"
                    :default-options="optionsElements"
                    :load-options="searchItems"
                    placeholder=""
                    label="name"
                />
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
            source: {
              title: "",
              description: "",
              slug: "",
              createdAt: "",
              mainImage: "",
            },
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
          source: {
            title: "",
            description: "",
            slug: "",
            createdAt: "",
            mainImage: "",
          },
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
        optionsElements:[],
        optionsUsers: [],
        searchOptions:[],
      }
    },
    computed: {
      checkAdminProfile(){
        let adminProfile = false
        this.$store.state.quserAuth.userData.roles.forEach(item =>{
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
          this.optionsUsers = this.$array.tree([this.$store.state.quserAuth.userData], {label: 'fullName', id: 'id'})
          const itemId = this.$clone(this.itemId)
          if (itemId) {
            let configName = 'apiRoutes.qfeed.sources'
            //Params
            let params = {
              refresh: true,
              params: {
                include: 'user',
                filter: {allTranslations: true}
              }
            }
            //Request
            this.$crud.show(configName, itemId, params).then(response => {
                Object.assign(this.form, { ...response.data })
                if(response.data.user != null) {
                  this.optionsUsers = this.$array.tree([response.data.user], {label: 'fullName', id: 'id'})
                }else{
                  this.optionsUsers = this.$array.tree([this.$store.state.quserAuth.userData], {label: 'fullName', id: 'id'})
                }
                this.getRSSOptions()
                this.optionsElements = this.$array.tree(this.optionsElements, {label: 'label', id: 'id'})
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
      //Search users
      searchUsers({action, searchQuery, callback}) {
        if (action === 'ASYNC_SEARCH') {
          let configName = 'apiRoutes.quser.users'
          let params = {//Params to request
            params: {filter: {search: searchQuery}},
          }
          //Request
          this.$crud.index(configName, params).then(response => {
            callback(null, this.$array.tree(response.data, { label: 'fullName', id: 'id' }))
          }).catch(error => {
            this.$alert.error({message: this.$tr('ui.message.errorRequest'), pos: 'bottom'})
          })
        }
      },
      //Search rss items
      searchItems({action, searchQuery, callback}) {
        if (action === 'ASYNC_SEARCH') {
          //Request
          this.recursiveElementsSearch(this.rssReturns,null,searchQuery)
          callback(null, this.$array.tree(this.searchOptions, { label: 'label', id: 'id' }))
        }
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
            this.optionsElements.push({label: key, id: key})
          } else {
            this.optionsElements.push({label: parent + '.' + key, id: parent + '.' + key})
          }
          if(typeof element[key] === 'object'){
            this.recursiveElements(element[key],key)
          }
        }
      },
      recursiveElementsSearch(element,parent=null,searchQuery = null){
        if(Array.isArray(element)){
          this.recursiveElements(element[0],parent,searchQuery)
          return;
        }
        for(let key in element){
          if(element.lastIndexOf(searchQuery) >= 0 || searchQuery == null) {
            if (parent == null) {
              this.searchOptions.push({label: key, id: key})
            } else {
              this.searchOptions.push({label: parent + '.' + key, id: parent + '.' + key})
            }
            if (typeof element[key] === 'object') {
              this.recursiveElements(element[key], key, searchQuery)
            }
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
