###
  knockback.js 0.16.0beta2
  (c) 2011, 2012 Kevin Malakoff.
  Knockback.js is freely distributable under the MIT license.
  See the following for full license details:
    https://github.com/kmalakoff/knockback/blob/master/LICENSE
  Dependencies: Knockout.js, Backbone.js, and Underscore.js.
    Optional dependency: Backbone.ModelRef.js.
###

# import Underscore (or Lo-Dash with precedence), Backbone, and Knockout
if (typeof(require) != 'undefined') then (try _ = require('lodash') catch e then _ = require('underscore')) else _ = @_
_ = _._ if _ and (_.hasOwnProperty('_')) # LEGACY
Backbone = if not @Backbone and (typeof(require) != 'undefined') then require('backbone') else @Backbone
ko = if not @ko and (typeof(require) != 'undefined') then require('knockout') else @ko

# export or create Knockback namespace and kb alias
Knockback = kb = @Knockback = @kb = if (typeof(exports) != 'undefined') then exports else {}
kb.VERSION = '0.16.0beta2'

# Locale Manager - if you are using localization, set this property.
# It must have Backbone.Events mixed in and implement a get method like Backbone.Model, eg. get: (attribute_name) -> return somthing
kb.locale_manager = undefined

# for ObservableTypes
kb.TYPE_UNKNOWN = 0
kb.TYPE_SIMPLE = 1
kb.TYPE_MODEL = 2
kb.TYPE_COLLECTION = 3

kb.release = (obj, keys_only) ->
  return false unless obj

  releaseObject = (obj) -> 
    if ko.isObservable(obj) and _.isArray(array = obj())
      if obj.__kb_is_co or (obj.__kb_is_o and (obj.valueType() is kb.TYPE_COLLECTION))
        if obj.destroy
          obj.destroy()
        else if obj.dispose # we may be releasing our observable
          obj.dispose()
      else if array.length
        view_models = array.slice(0)
        array.splice(0, array.length)
        kb.release(view_model) for view_model in view_models
    else if obj.destroy
      obj.destroy()
    else if obj.release
      obj.release()
    else if obj.dispose
      obj.dispose()
    return obj

  # known type
  if not keys_only and (ko.isObservable(obj) or (typeof(obj.dispose) is 'function') or (typeof(obj.destroy) is 'function') or (typeof(obj.release) is 'function'))
    releaseObject(obj)

  # view model
  else if _.isObject(obj) and not (typeof(obj) is 'function')
    for key, value of obj
      continue if not value or (key is '__kb')
      continue unless ko.isObservable(value) or (typeof(value.dispose) is 'function') or (typeof(value.destroy) is 'function') or (typeof(value.release) is 'function')
      obj[key] = null; releaseObject(value)

  return

####################################
# HELPERS
####################################
arraySlice = Array.prototype.slice
arraySplice = Array.prototype.splice
throwMissing = (instance, message) -> throw "#{instance.constructor.name}: #{message} is missing"
throwUnexpected = (instance, message) -> throw "#{instance.constructor.name}: #{message} is unexpected"

legacyWarning = (identifier, last_version, message) ->
  kb._legacy_warnings or= {}
  kb._legacy_warnings[identifier] or= 0
  kb._legacy_warnings[identifier]++
  console.warn("warning: '#{identifier}' has been deprecated (will be removed in Knockback after #{last_version}). #{message}.")


