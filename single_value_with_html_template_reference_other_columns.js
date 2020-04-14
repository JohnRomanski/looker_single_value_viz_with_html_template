looker.plugins.visualizations.add({
    options: {
        html_template: {
            type: "string",
            label: "HTML Template",
            default: `<style>

body {
  font-size:10px;
  color:#404040;
  font-family:'Open Sans';
  text-align: center;
}

.grid-container {
  display: grid;
  grid-template-columns:  2fr 3fr 2fr 3fr ;
  grid-gap: 5px;
  grid-auto-rows: auto;
}

.ge {
  font-family:'Open Sans';
  font-weight:1000;
  text-align: right;
}
.gf {
  text-align: left;
}

</style>
<div class="grid-container">
  <div class='ge'> {{ column_2 }} </div>
  <div class='gf'> {{ label_2 }} </div>
  <div class='ge'> {{ column_3 }} </div>
  <div class='gf'> {{ label_3 }} </div>
  <div class='ge'> {{ column_4 }} </div>
  <div class='gf'> {{ label_4 }} </div>
  <div class='ge'> {{ column_5 }} </div>
  <div class='gf'> {{ label_5 }} </div>
</div> </div>`
        }
    },

    create: function(element, config) {},

    updateAsync: function(data, element, config, queryResponse, details, doneRendering) {
        this.clearErrors();

        //let htmlTemplate = config && config.html_template || this.options.html_template.default;
				let htmlTemplate = this.options.html_template.default;
        const firstRow = data[0];
        const qFields = queryResponse.fields;

        if (qFields.dimension_like.length === 0 &&
            qFields.measure_like.length === 0) {
            this.addError({
                title: `No visible fields`,
                message: `At least one dimension, measure or table calculation needs to be visible.`
            })
        }

        const firstRowFields = qFields.dimension_like.concat(qFields.measure_like);
        const firstRowLabels = qFields.measures;
        for(field in firstRowFields) {
            const index = parseInt(field);
            const columnIndex = index + 1;
            const columnRef = `column_${columnIndex}`;
            const labelRef = `label_${columnIndex}`;
            const columnRexExpSingleVal = new RegExp("{{( *)value ( *)}}", "g");
            const columnRexExpNumeric = new RegExp("{{( *)" + columnRef + "( *)}}", "g");
            const labelRexExpNumeric = new RegExp("{{( *)" + labelRef + "( *)}}", "g");
            const columnRexExpByRef = new RegExp("{{( *)" + firstRowFields[field].name + "( *)}}", "g");
            const columnValue = LookerCharts.Utils.filterableValueForCell(firstRow[firstRowFields[field].name]);
            const labelRefbyLabel = new RegExp("{{( *)" + firstRowFields[field].name + ".label( *)}}", "g");
            const labelValue = firstRowFields[field].label_short;
          
            htmlTemplate = htmlTemplate.replace(columnRexExpSingleVal, columnValue);
            htmlTemplate = htmlTemplate.replace(columnRexExpByRef, columnValue);
            htmlTemplate = htmlTemplate.replace(columnRexExpNumeric, columnValue);
            htmlTemplate = htmlTemplate.replace(labelRefbyLabel, labelValue);
            htmlTemplate = htmlTemplate.replace(labelRexExpNumeric, labelValue);
        }
        console.warn(htmlTemplate);

        element.innerHTML = htmlTemplate;

        doneRendering();
    }
});