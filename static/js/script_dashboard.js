/**
 * Created by Vaibhav on 18/9/16.
 */


$(document).ready(function(){

    // For select input
    $('select').material_select();

    var commit_log_open = false;                // flag varible for commit log
    $('ul.tabs').tabs();

    $('.commit-log').click(function (evt) {
        evt.preventDefault();

        if(!commit_log_open) {
            $('.commit-log-div').animate({width: "30%"});
            $('.project-directory').animate(({width: "70%"}));
            $('.commit-log-div').css('border-left','2px solid #888888');
            commit_log_open = true;
        }
        
        else {
            $('.commit-log-div').animate({width: "0"});
            $('.project-directory').animate(({width: "100%"}));
            $('.commit-log-div').css('border-left','none');
            commit_log_open = false;
        }
    });

    $('.modal-trigger').leanModal();

    $('.new-file-folder').click(function() {

        $(".create-new-form").attr('id',$(this).attr('id'));

        var heading = $("#new-file-folder h2");

        if($(this).attr('id') == 'new-folder')
            heading.text('Create New Folder');

        else
            heading.text('Create New File');
    });

    $(".create-new-form").submit(function (evt) {

        evt.preventDefault();

        var type = $(this).attr('id');
        var name = $(evt.target).find('[name="name"]').val();

        console.log(type);
        console.log(name);

        var data = { name: name , type: type };

        $.ajax({
            url: '/create_new',
            method: 'post',
            data: data,
            dataType: 'json'
        }).
            done(function(data) {
                if ( data['status'] == 0 ){

                        var elements_final = [];
                        var elements

                        if(type == 'new-folder')
                            elements = $(".folders");

                        else if (type == 'new-file')
                            elements = $(".files");

                        var i;
                        var f;

                        for (f=0; f < elements.length; f++) {
                            elements_final.push($(elements_final[f]).find('p').text());
                        }

                        elements_final.push(name);

                        elements_final.sort(function(a,b){
                            if(a.indexOf(b) == 0)
                                return 1;
                            else if(b.indexOf(a) == 0)
                                return -1

                            else
                                return a-b;
                        });

                        i = elements_final.indexOf(name);

                        console.log(i);

                        if (type == 'new-folder') {

                            if (i > 0)
                                $(".folders:nth-child(" + i + ")").after('<tr class="folders"><td> <i class="fa fa-folder"></i> <p>' + name + '/ </p> </td></tr>');
                            else
                                $(".folders:first-child").before('<tr class="folders"><td> <i class="fa fa-folder"></i> <p>' + name + '/ </p> </td></tr>');
                        }

                        else if (type == 'new-file') {
                             if (i > 0)
                                $(".files:nth-child(" + i + ")").after('<tr class="folders"><td> <i class="fa fa-file-code-o"></i> <p>' + name + '/ </p> </td></tr>');
                             else
                                $(".files:first-child").before('<tr class="folders"><td> <i class="fa fa-file-code-o"></i> <p>' + name + '/ </p> </td></tr>');
                        }
            }
        }).
            fail(function(err) {
                console.log(err);
        }) ;

    });

    $(document).on('dblclick','.folders',function(){

        var dir_path = $(this).find('p').text().slice(0,-1);

        changeDir(dir_path,function(){
            $(".breadcrumbs-div").append('<a href="#!" class="breadcrumb">' + dir_path + '</a>');
        });
    });

    $(document).on('click','.breadcrumb',function(evt){
        evt.preventDefault();
        var breadcrumbs = $('.breadcrumb');
        var back_times;
        var dir_path = "";
        var i;

        l = breadcrumbs.length;

        for (i in breadcrumbs) {
            if(evt.target === breadcrumbs[i]) {
                back_times = l-i-1;
                break;
            }
        }

        for(i=0; i< back_times; i++ )
            dir_path = dir_path + "../"

        changeDir(dir_path,function() {

            for(i=0; i<back_times; i++)
                $(".breadcrumb:last-child").remove();
        });
    });

    /* ====================== For add new branch form ===================================== */

    $("form#add-new-branch").submit(function (evt) {
        evt.preventDefault();

        var post_data = {};

        post_data.branch_name = $(evt.target).find('[name="branch-name"]');
        post_data.members = $(evt.target).find('[name="members"]');
        post_data.id = $("#project_id").text();

        $.ajax({

            url: '/new-branch',
            method: 'POST',
            data: post_data,
            dataType: 'json',
        }).
            done(function(res) {
                alert(res.message);

                if (!res.status)

                else


        });

    });

});

function changeDir(dir_path,callback){
    console.log("Hello");
    var data = { dir_path: dir_path };

    $.ajax({
        url: window.location.href,
        method: 'POST',
        data: data,
        dataType: 'json',
    }).
    done(function(res){

        var table = $("table.project-directory tbody");
        table.html("");

        for (d in res.directories){
            table.append('<tr class="folders"><td> <i class="fa fa-folder"></i> <p>' + res.directories[d] + '/</p> </td></tr>')
       }

       for (f in res.files){
            table.append('<tr class="files"><td> <i class="fa fa-file-code-o"></i> <p>' + res.files[f] + '</p> </td></tr>')
       }

       callback(res);
    }).

    fail(function(err) {
        console.log(err);
    });


}