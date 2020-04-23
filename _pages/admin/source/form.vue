<template>
  <div id="pageId" class="q-layout-page layout-padding">

    <div class="relative-position q-mb-lg backend-page" v-if="success">
      <div class="box">
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
                   :label="`${$tr('qfeed.layout.form.url')}`"/>

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

          <div class="row">

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
        <inner-loading :visible="loading"/>
      </div>
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
          userId: this.$store.state.quserAuth.userId,
          options: {}
        },
        loading: false,
        success: false,
        itemId: false,
        optionsType: [],
        optionsStatus: [],
      }
    },
    computed: {
      dataLocale() {
        return {
          fields: {
            name: '',
            url: '',
            type: '',
            status: '1',
            userId: this.$store.state.quserAuth.userId,
          },
        }
      },
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
                this.form.type = parseInt(response.data.type)
                this.form.status = parseInt(response.data.status)
                this.getRSSOptions()
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
          this.form.options = response.data
        })
      },
      async updateItem() {
          this.loading = true
          let configName = 'apiRoutes.qfeed.sources'
          this.$crud.update(configName, this.itemId, this.form).then(response => {
            this.$alert.success({message: `${this.$tr('ui.message.recordUpdated')}`})
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
