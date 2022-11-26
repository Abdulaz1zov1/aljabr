$(document).ready(function() {
    
    "use strict";
    $('#zero-conf').DataTable({
        language: {
            processing:     "Traitement en cours...",
            search:         "Поиск&nbsp;:",
            lengthMenu:    "Показать _MENU_ записи",
            info:           "Отображение от _START_ до _END_ из _TOTAL_ записей",
            infoEmpty:      "Записи нет",
            infoFiltered:   "(filtr&eacute; de _MAX_ &eacute;l&eacute;ments au total)",
            infoPostFix:    "",
            // loadingRecords: "Chargement en cours...",
            zeroRecords:    "Совпадающих записей не найдено",
            emptyTable:     "Aucune donnée disponible dans le tableau",
            paginate: {
                first:      "Первый",
                previous:   "Пред",
                next:       "След",
                last:       "Последный"
            },
            aria: {
                sortAscending:  ": activer pour trier la colonne par ordre croissant",
                sortDescending: ": activer pour trier la colonne par ordre décroissant"
            }
        },
        "displayLength": 50,
    });

    $('#complex-header').DataTable();

    var groupColumn = 2;
    var table = $('#row-grouping').DataTable({
        "columnDefs": [
            { "visible": false, "targets": groupColumn }
        ],
        "order": [[ groupColumn, 'asc' ]],
        "displayLength": 25,
        "drawCallback": function ( settings ) {
            var api = this.api();
            var rows = api.rows( {page:'current'} ).nodes();
            var last=null;
 
            api.column(groupColumn, {page:'current'} ).data().each( function ( group, i ) {
                if ( last !== group ) {
                    $(rows).eq( i ).before(
                        '<tr class="group"><td colspan="5">'+group+'</td></tr>'
                    );
 
                    last = group;
                }
            } );
        }
    } );
 
    // Order by the grouping
    $('#row-grouping tbody').on( 'click', 'tr.group', function () {
        var currentOrder = table.order()[0];
        if ( currentOrder[0] === groupColumn && currentOrder[1] === 'asc' ) {
            table.order( [ groupColumn, 'desc' ] ).draw();
        }
        else {
            table.order( [ groupColumn, 'asc' ] ).draw();
        }
    } );
    
    var t = $('#add-row').DataTable();
    var counter = 1;
 
    $('#addRow').on( 'click', function (e) {
        t.row.add( [
            counter +'.1',
            counter +'.2',
            counter +'.3',
            counter +'.4',
            counter +'.5'
        ] ).draw( false );
        counter++;
        e.preventDefault();
    } );
 
    // Automatically add a first row of data
    $('#addRow').click();
});