$(() => {

  appendOption = (id, value, text, data_id, data_value, selected) => {
    var select_menu = $(`#${id}`);
    var option = $('<option>', {
      value: value,
      text: text
    });

    if (data_id && data_value) {
      option.attr(`data-${data_id}`, data_value);
    }

    if (selected) {
      option.attr('selected', 'selected');
    }

    select_menu.append(option);
  }

  listWazoUsers = (conn, user_uuid, id, choice) => {
    const id_name = id ? `${id}_name` : 'user_name';
    const id_uuid = id ? `${id}_uuid` : 'user_uuid';
    const choice_name = choice ? choice : 'Choose user...';

    $(`#node-input-${id_name}`).find('option').remove().end();
    $(`#node-input-${id_uuid}`).val('');
    appendOption(`node-input-${id_name}`, "", choice_name);

    $(`#node-input-${id_name}`).change(() => {
      var user_uuid = $(`#node-input-${id_name} option:selected`).data('uuid');
      $(`#node-input-${id_uuid}`).val(user_uuid);
    });

    const params = {
      host: conn.host,
      port: conn.port,
      refreshToken: conn.refreshToken
    }

    $.post('/wazo-platform/users', params, (res) => {
      res.items.map(item => {
        let selected = false;
        name = `${item.firstname} ${item.lastname}`;

        if (user_uuid == item.uuid) { selected = true; }
        appendOption(`node-input-${id_name}`, name, name, "uuid", item.uuid, selected);
        if (selected) { $(`#node-input-${id_uuid}`).val(item.uuid); }
      });
    });
  }

});
