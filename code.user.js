// ==UserScript==
// @name         SaltyStats
// @namespace    https://rokit.dev
// @author       trey-k (roguerobots)
// @version      1
// @description  Makes SaltyBet tournament stats easier to read
// @include      /^.*saltybet\.com\/stats\?tournament_id?(.*)*$/
// @run-at       document-body
// @grant        GM_addStyle
// @homepageURL  https://github.com/trey-k/saltystats
// @supportURL   https://github.com/trey-k/saltystats/issues
// @downloadURL  https://raw.githubusercontent.com/trey-k/saltystats/master/code.user.js
// @updateURL    https://raw.githubusercontent.com/trey-k/saltystats/master/code.user.js
// ==/UserScript==

GM_addStyle(`
    .blue.winner {
        background-color: rgba(52, 158, 255, 0.75);
    }
    .red.winner {
        background-color: rgba(209, 72, 54, 0.75);
    }
    .winner .bluetext, .winner .redtext {
        color: #FFFFFF;
    }
    .pbet {
        color: #4db044;
    }
    .ratio {
        font-weight: bold;
    }
    .ratio span {
        display: inline-block;
        width: 30px;
        text-align: left;
    }
    .ratio span:first-of-type {
        text-align: right;
    }
`);

var $ = jQuery;

function parseBet (bet) {
    if(parseInt(bet) >= 1000000) {
        return (bet / 1000000).toFixed(1) + 'M';
    } else if(parseInt(bet) >= 1000) {
        return (bet / 1000).toFixed(1) + 'K';
    } else {
        return bet;
    }
}

$(document).ready(function() {
    setTimeout(function () {
        $('.leaderboard').dataTable().fnDestroy();
        $('.leaderboard').css('width', '');
        $('.leaderboard thead tr th')[1].remove()
        $('.leaderboard thead tr th')[0].remove()
        $('.leaderboard thead tr').prepend('<th class="sorting" role="columnheader" tabindex="0" aria-controls="DataTables_Table_0" rowspan="1" colspan="1" aria-label="Red: activate to sort column ascending" style="width: 360px;">Red</th>' +
            '<th class="sorting" role="columnheader" tabindex="0" aria-controls="DataTables_Table_0" rowspan="1" colspan="1" aria-label="Red Bets: activate to sort column ascending" style="">Red Bets</th>' +
            '<th class="sorting" role="columnheader" tabindex="0" aria-controls="DataTables_Table_0" rowspan="1" colspan="1" aria-label="Ratio: activate to sort column ascending" style="">Ratio</th>' +
            '<th class="sorting" role="columnheader" tabindex="0" aria-controls="DataTables_Table_0" rowspan="1" colspan="1" aria-label="Blue Bets: activate to sort column ascending" style="">Blue Bets</th>' +
            '<th class="sorting" role="columnheader" tabindex="0" aria-controls="DataTables_Table_0" rowspan="1" colspan="1" aria-label="Blue: activate to sort column ascending" style="width: 360px;">Blue</th>');
        $('.leaderboard tbody tr').each(function () {
            var tds = $(this).find('td');
            var dissect = $(tds[0]).text();
            var url = $(tds[0]).find('a').attr('href');
            var winner = $(tds[1]).html();
            var p1odds = 1;
            var p2odds = 1;
            $(tds[0]).remove();
            $(tds[1]).remove();
            dissect = dissect.match(/(.*)\s-\s\$(\d*),\s(.*)\s-\s\$(\d*)/);
            if (parseInt(dissect[2]) >= parseInt(dissect[4])) {
                p1odds = Math.round((dissect[2] / dissect[4]) * 10) / 10;
            } else {
                p2odds = Math.round((dissect[4] / dissect[2]) * 10) / 10;
            }
            $(this).prepend('<td class="red ' + (winner.includes('redtext') ? 'winner' : '') + '"><a href="' + url + '"><span class="redtext">' + dissect[1] + '</span></a></td>' +
                '<td class="pbet">' + dissect[2] + '</td>' +
                '<td class="ratio"><span class="redtext">' + p1odds + '</span> : <span class="bluetext">' + p2odds + '</span></td>' +
                '<td class="pbet">' + dissect[4] + '</td>' +
                '<td class="blue ' + (winner.includes('bluetext') ? 'winner' : '') + '"><a href="' + url + '"><span class="bluetext">' + dissect[3] + '</span></a></td>');
        });
        $('.leaderboard').dataTable({
            "bPaginate": false,
            "bLengthChange": false,
            "aaSorting": [],
            "aoColumnDefs": [{
                "aTargets": [ 2 ],
                "mRender": function ( data, type, full ) {
                    if(type === "display") {
                        return data;
                    }
                    var ratio = data.split(':');
                    return (parseFloat($(ratio[0]).text()) >= parseFloat($(ratio[1]).text()) ? $(ratio[0]).text() : $(ratio[1]).text());
                }
            }]
        });
        $('.pbet').each(function () {
            $(this).text('$' + parseBet($(this).text()));
        });
    }, 500);
});