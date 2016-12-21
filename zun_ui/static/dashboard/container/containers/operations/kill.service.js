/**
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use self file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

(function() {
  'use strict';

  angular
    .module('horizon.dashboard.container.containers')
    .factory(
      'horizon.dashboard.container.containers.kill.service',
      killContainerService);

  killContainerService.$inject = [
    'horizon.app.core.openstack-service-api.zun',
    'horizon.dashboard.container.containers.basePath',
    'horizon.framework.util.i18n.gettext',
    'horizon.framework.util.q.extensions',
    'horizon.framework.widgets.form.ModalFormService',
    'horizon.framework.widgets.toast.service'
  ];

  /**
   * @ngdoc factory
   * @name horizon.dashboard.container.containers.kill.service
   * @description
   * Service to send kill signals to the container
   */
  function killContainerService(
    zun, basePath, gettext, $qExtensions, modal, toast
  ) {
    // schema
    var schema = {
      type: "object",
      properties: {
        signal: {
          title: gettext("Kill Signal"),
          type: "string"
        }
      }
    };

    // form
    var form = [
      {
        type: 'section',
        htmlClass: 'row',
        items: [
          {
            type: 'section',
            htmlClass: 'col-sm-6',
            items: [
              {
                "key": "signal",
                "placeholder": gettext("The kill signal to send.")
              }
            ]
          },
          {
            type: 'template',
            templateUrl: basePath + 'operations/kill.help.html'
          }
        ]
      }
    ];

    // model
    var model;

    var message = {
      success: gettext('Kill signal was successfully sent to container %s.')
    };

    var service = {
      initAction: initAction,
      perform: perform,
      allowed: allowed
    };

    return service;

    //////////////

    function initAction() {
    }

    function allowed() {
        return $qExtensions.booleanAsPromise(true);
      }

    function perform(selected) {
      model = {
        id: selected.id,
        name: selected.name,
        signal: ''
      };
      // modal config
      var config = {
        "title": gettext('Send Kill Signal'),
        "submitText": gettext('Send'),
        "schema": schema,
        "form": form,
        "model": model
      };
      return modal.open(config).then(submit);
    }

    function submit(context) {
      var id = context.model.id;
      var name = context.model.name;
      delete context.model.id;
      delete context.model.name;
      return zun.killContainer(id, context.model).then(function(response) {
        toast.add('success', interpolate(message.success, [name]));
      });
    }
  }
})();
