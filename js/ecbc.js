
var Android = {
    ventilation: function () {
        return "AC";
    },
    climate: function() {
        return "Hot & Dry";
    },
    compliance: function() {
        return "SuperECBC,ECBC+";
    },
    parentCategory: function() {
        return "Business";
    },
    category: function() {
        return "Small Office";
    },
    print: function() {
        alert('printing');
    },
    location: function() {
        return "Delhi";
    }
};

function parentCategoryOf(cat) {
    switch (cat) {
        case "Star Hotel":
        case "No Star Hotel":
        case "Resort": return "Hospitality";

        case "College":
        case "Educational":
        case "University":
        case "Institution":
        case "School": return "Educational";

        case "Hospital":
        case "Outpatient": return "Healthcare";

        case "Mall":
        case "Standalone Retail":
        case "Open Gallery Mall":
        case "Supermarket": return "Shopping Complex";

        case "Large Office":
        case "Large Office (>30k sqm)":
        case "Medium Office":
        case "Small Office":
        case "Small Office (<10k sqm)": return "Business";

        case "Multiplex":
        case "Theatre":
        case "Building for transport": return "Assembly";
    }
}

function containsSomeCategory(txt) {
    return txt.match(/Star Hotel|No Star|Hotel|Resort|Hospitality|College|Educational|University|Institution|School|Educational|Hospital|Outpatient|Healthcare|Mall|Standalone Retail|Open Gallery Mall|Supermarket|Shopping Complex|Large Office|Medium Office|Small Office|Business|Multiplex|Theatre|Building for transport|Assembly/i);
}

function containsChosenCategory(txt, cat) {
    return cat == 'All' || txt.toLowerCase().indexOf(cat.toLowerCase()) >= 0 || txt.toLowerCase().indexOf(parentCategoryOf(cat).toLowerCase()) >= 0;
}

function containsSomeClimate(txt) {
    return txt.match(/warm and humid|warm & humid|temperate|cold|hot and dry|hot & dry|composite/i);
}

function containsChosenClimate(txt, c) {
    return c == 'All' || txt.replace('and', '&').toLowerCase().indexOf(c.toLowerCase()) >= 0;
}

function containsSomeCompliance(txt) {
    var m = txt.match(/ECBC\+|SuperECBC|ECBC/i);
    if (m)
        m = m[0] == "ECBC+" ? "ECBCPlus" : m[0];
    return m;
}

function containsChosenCompliance(txt, c) {
    for (var i = 0; i < c.length; i++) {
        if (txt.split(/\s/).indexOf(c[i]) >= 0) {
            return true;
        }
    }
    // no match
    return false;
}

function tooLong(txt) { // 9-1
    return txt.length > 128;
}

$("table").addClass("table table-striped table-sm table-responsive");


$( document ).ready(function() {

    var appliedFilters = [];

    //show/hide applied filters at the top
    if (Android.category() != 'All')
        $('#appliedFilters').append('<a class="navbar-brand" href="#">'+Android.category()+'</a>');
    if (Android.location() != 'All')
        $('#appliedFilters').append('<a class="navbar-brand" href="#">'+Android.location().split(',')[0]+'</a>');
    if (Android.climate() != 'All')
        $('#appliedFilters').append('<a class="navbar-brand" href="#">'+Android.climate()+'</a>');
    if (Android.category() == 'All' && Android.location() == 'All')
        $('#appliedFilters').hide();

    //color items marked with an '*'
    $('li.list-group-item:contains("*")').css('color', '#900C3F');

    // wrap h5 elements into an accordion of cards
    $('h5').each(function(index) {
        /* From this:-
        <h5><i class="fa fa-angle-down"></i>Lorem Ipsum</h5>
        <p/>
        ..
        <h5><i class="fa fa-angle-down"></i>Dolor Immet</h5>
        Create this for bootstrap's collapse:-
        /*<div class="card">
        <div class="card-header" id="headingTwo">
          <h5 class="mb-0 collapsed" data-toggle="collapse" data-target="#collapseTwo" >
            Lorem Ipsum
          </h5>
        </div>
        <div id="collapseTwo" class="collapse" data-parent="#accordion">
          <div class="card-body">
           <p/>
           ..
          </div>
        </div>
      </div>*/
        // extract id from section number
        var id = 'collapse'+$(this).text().match(/\d+(\.\d+)*/)[0].replace(/\./g, '_');

        // wrap body
        $(this).nextUntil('h5').not('footer').wrapAll('<div class="card-body">');
        $(this).next().wrap('<div class="collapse" data-parent="#accordion">');
        $(this).next().attr("id", id);

        // wrap h5
        $(this).wrap('<div class="card-header">');
        $(this).addClass('mb-0');
        $(this).addClass('collapsed');
        $(this).addClass('h6');
        if ($(this).text().indexOf('*') >= 0)
            $(this).addClass('text-danger');
        $(this).attr('data-toggle','collapse');
        $(this).attr('data-target','#'+id);

        // wrap both
        $(this).parent().next().addBack().wrapAll('<div class="card">');
    }
    );

    //wrap all in an accordion and the accordion in a container
    $('.card').wrapAll('<div id="accordion">');
    $('#accordion').wrap('<div id="container">');

    // category filtering
    $("tr").each(function() {
        var txt = $(this).find('td').first().text();
        if (!tooLong(txt) && containsSomeCategory(txt) && !containsChosenCategory(txt, Android.category())) {
            $(this).hide();
        }
    });

    // climate filtering
    $("th").each(function() {
        var txt = $(this).text();
        if (containsSomeClimate(txt) && !containsChosenClimate(txt, Android.climate())) {
            var index = $(this).index()+1; //nth-child takes 1 based indices
            $(this).closest('table').find('tr td:nth-child(' + index + ')').not('[colspan]').hide();
            $(this).hide();

        }
    });
    // compliance filtering tables
    $("table").each(function() {
        var txt = $(this).find('th').first().text();
        if (containsSomeCompliance(txt) && !containsChosenCompliance(txt, Android.compliance().split(/,/))) {
            $(this).hide();
        }
    });

    // compliance coloring tables
    $("thead th").each(function() {
        var txt = $(this).text();
        var m = containsSomeCompliance(txt);
        if (m)
            $(this).addClass(m);
    });

    // compliance filtering columns
    $("th").each(function() {
        var txt = $(this).text();

        if (containsSomeCompliance(txt) && !containsChosenCompliance(txt, Android.compliance().split(/,/))) {
            // count previous non colspan columns
            var index = $(this).prevAll("th").not('[colspan]').length+1;

            // add colspans of previous colspan columns and remember current's
            $(this).prevAll("th[colspan]").each(function() {
                index = index + parseInt($(this).attr('colspan'));
            });

            // remove columns at index
            var l = $(this).attr('colspan') ? parseInt($(this).attr('colspan')) : 1;
            for (var i = 0; i < l; i++) {
                $(this).parent().nextAll().find('th:nth-child(' + (index+i) + ')').hide(); //5-1
                // th's above are siblings, so need a different approach for td
                $(this).closest('table').find('tr td:nth-child(' + (index+i) + ')').hide();
            }

            $(this).hide();
        }
    });
    // compliance coloring columns
    $("tbody th").each(function() {
        var txt = $(this).text();
        var m = containsSomeCompliance(txt);

        if (m) {

            // count previous non colspan columns
            var index = $(this).prevAll("th").not('[colspan]').length+1;

            // add colspans of previous colspan columns and remember current's
            $(this).prevAll("th[colspan]").each(function() {
                index = index + parseInt($(this).attr('colspan'));
            });

            // add class to columns at index
            var l = $(this).attr('colspan') ? parseInt($(this).attr('colspan')) : 1;
            for (var i = 0; i < l; i++) {
                $(this).parent().nextAll().find('th:nth-child(' + (index+i) + ')').addClass(m); //5-1
                // th's above are siblings, so need a different approach for td
                $(this).closest('table').find('tr td:nth-child(' + (index+i) + ')').addClass(m);
            }
        }
    });

    // add id to tables
    $("table").each(function() {
        var matches = $(this).find('th').first().text().match(/Table (\d+-\d+)/);
        $(this).attr('id',  "Table" + matches[1]);
    });

    //  toggling of accordion icons
    function toggleChevron(e) {
        $(e.target)
        .parent()
        .find('i.fa')
        .toggleClass('fa-angle-down fa-angle-up');
    }
    $('#accordion').on('hidden.bs.collapse', toggleChevron);
    $('#accordion').on('shown.bs.collapse', toggleChevron);

    // approximation - if there is a hash in url then click it
    if(location.hash != null && location.hash != ""){
        $(location.hash).click();
    }

    $('#print').click(function() {
        $('.collapse').collapse('dispose');
        $('.navbar').hide();
    });

});
