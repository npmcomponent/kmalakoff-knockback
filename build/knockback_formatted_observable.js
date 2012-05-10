// Generated by CoffeeScript 1.3.1
/*
  knockback_formatted_observable.js
  (c) 2011 Kevin Malakoff.
  Knockback.FormattedObservable is freely distributable under the MIT license.
  See the following for full license details:
    https://github.com/kmalakoff/knockback/blob/master/LICENSE
*/

Knockback.toFormattedString = function(format) {
  var arg, args, index, parameter_index, result, value;
  result = format.slice();
  args = Array.prototype.slice.call(arguments, 1);
  for (index in args) {
    arg = args[index];
    value = ko.utils.unwrapObservable(arg);
    if (!value) {
      value = '';
    }
    parameter_index = format.indexOf("\{" + index + "\}");
    while (parameter_index >= 0) {
      result = result.replace("{" + index + "}", value);
      parameter_index = format.indexOf("\{" + index + "\}", parameter_index + 1);
    }
  }
  return result;
};

Knockback.parseFormattedString = function(string, format) {
  var count, format_indices_to_matched_indices, index, match_index, matches, parameter_count, parameter_index, positions, regex, regex_string, results, sorted_positions, _i, _results;
  regex_string = format.slice();
  index = 0;
  parameter_count = 0;
  positions = {};
  while (regex_string.search("\\{" + index + "\\}") >= 0) {
    parameter_index = format.indexOf("\{" + index + "\}");
    while (parameter_index >= 0) {
      regex_string = regex_string.replace("\{" + index + "\}", '(.*)');
      positions[parameter_index] = index;
      parameter_count++;
      parameter_index = format.indexOf("\{" + index + "\}", parameter_index + 1);
    }
    index++;
  }
  count = index;
  regex = new RegExp(regex_string);
  matches = regex.exec(string);
  if (matches) {
    matches.shift();
  }
  if (!matches || (matches.length !== parameter_count)) {
    return _.map((function() {
      _results = [];
      for (var _i = 1; 1 <= count ? _i <= count : _i >= count; 1 <= count ? _i++ : _i--){ _results.push(_i); }
      return _results;
    }).apply(this), function() {
      return '';
    });
  }
  sorted_positions = _.sortBy(_.keys(positions), function(parameter_index, format_index) {
    return parseInt(parameter_index, 10);
  });
  format_indices_to_matched_indices = {};
  for (match_index in sorted_positions) {
    parameter_index = sorted_positions[match_index];
    index = positions[parameter_index];
    if (format_indices_to_matched_indices.hasOwnProperty(index)) {
      continue;
    }
    format_indices_to_matched_indices[index] = match_index;
  }
  results = [];
  index = 0;
  while (index < count) {
    results.push(matches[format_indices_to_matched_indices[index]]);
    index++;
  }
  return results;
};

Knockback.FormattedObservable = (function() {

  FormattedObservable.name = 'FormattedObservable';

  function FormattedObservable(format, args) {
    var observable, observable_args;
    this.__kb = {};
    observable_args = Array.prototype.slice.call(arguments, 1);
    observable = kb.utils.wrappedObservable(this, ko.dependentObservable({
      read: function() {
        var arg, _i, _len;
        args = [ko.utils.unwrapObservable(format)];
        for (_i = 0, _len = observable_args.length; _i < _len; _i++) {
          arg = observable_args[_i];
          args.push(ko.utils.unwrapObservable(arg));
        }
        return kb.toFormattedString.apply(null, args);
      },
      write: function(value) {
        var index, matches, max_count, _results;
        matches = kb.parseFormattedString(value, ko.utils.unwrapObservable(format));
        max_count = Math.min(observable_args.length, matches.length);
        index = 0;
        _results = [];
        while (index < max_count) {
          observable_args[index](matches[index]);
          _results.push(index++);
        }
        return _results;
      }
    }));
    return observable;
  }

  FormattedObservable.prototype.destroy = function() {
    return kb.utils.wrappedObservable(this, null);
  };

  return FormattedObservable;

})();

Knockback.formattedObservable = function(format, args) {
  return new Knockback.FormattedObservable(format, args);
};