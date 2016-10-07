/**
 * Created by Vaibhav on 18/9/16.
 */


$(document).ready(function(){

    current_branch = $("#current_branch").text();

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

            $.ajax({
                url : '/get_commits',
                method: 'post',
                data : {  proj_id : $("#project_id").text() , branch : $("#current_branch").text()  },
                dataType: 'json',

            }).done(function(res){

                console.log(res);

                $(".commit-log-div").empty();
                var commit_card = '<div class="card blue-grey darken-1"> <div class="card-content white-text"> <p class="commit-message"></p> \
                    <p class="author"></p> <p class="date-time" </div> <div class="card-action"> \
                    <a href="#">This is a link</a> <a href="#">This is a link</a> </div></div>'

                var commits = res.commits;

                for (c in commits) {
                    $(".commit-log-div").append(commit_card);
                    $(".commit-log-div .card:last-of-type .commit-message").text(commits[c].comment);
                    $(".commit-log-div .card:last-of-type .author").text(commits[c].user);
                    $(".commit-log-div .card:last-of-type .date-time").text(commits[c].date);
                }
            }).
                fail(function(err){
                    console.log(err);
            })
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
                                return -1;

                            else
                                return a-b;
                        });

                        i = elements_final.indexOf(name);

                        console.log(i);

                        if (type == 'new-folder') {

                            if (i > 0)
                                $(".folders:nth-child(" + i + ")").after('<tr class="folders"><td> <i class="fa fa-folder"></i> <p>' + name + '/ </p> </td></tr>');
                            else
                                // $(".folders:first-child").before('<tr class="folders"><td> <i class="fa fa-folder"></i> <p>' + name + '/ </p> </td></tr>');
                                $("tbody").prepend('<tr class="folders"><td> <i class="fa fa-folder"></i> <p>' + name + '/ </p> </td></tr>');

                        }

                        else if (type == 'new-file') {
                             if (i > 0)
                                $(".files:nth-child(" + i + ")").after('<tr class="files"><td> <i class="fa fa-file-code-o"></i> <p>' + name + '/ </p> </td></tr>');
                             else
                                // $(".files:first-child").before('<tr class="folders"><td> <i class="fa fa-file-code-o"></i> <p>' + name + '/ </p> </td></tr>');
                                $("tbody").append('<tr class="files"><td> <i class="fa fa-file-code-o"></i> <p>' + name + '/ </p> </td></tr>');
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
        console.log("Form submit");
        var post_data = {};

        post_data.branch_name = $(evt.target).find('[name="branch-name"]').val();
        post_data.members = $(evt.target).find('[name="members"]').val();
        post_data.id = $("#project_id").text();

        $.ajax({
            url: '/new_branch',
            method: 'POST',
            data: JSON.stringify(post_data),
            dataType: 'json',
            contentType: 'application/json'
        }).
            done(function(res) {
                alert(res.message);

                if (!res.status){
                    $("#projects-branches ul").append('<li class="tab"> <a class="waves-effect white-text">' + post_data.branch_name +'</a></li>')
                }
        }).
            fail(function(err){
                console.log(err);
        });

    });

    /* ============= For branch checkout ========================================= */

    $(".branches").click(function(evt){
        evt.preventDefault();

        var proj_id = $("#project_id").text();
        var branch_name = $(this).text();

        var post_data = { proj_id : proj_id, branch_name : branch_name };

        $.ajax({
            url: '/checkout',
            method: 'POST',
            data: post_data,
            dataType: 'json',
        }).
            done(function(res){

            if(!res.response.status)
                displayDirStructure(res.list_dir);

            alert(res.response.message)
        }).
            fail(function(err){
            console.log(err);
        })
    });

    /* ============================ For editing ================================= */

    $(".edit").click(function(){
        var path = $(this).parent().find("p").text();

        $.ajax({
            url: '/edit',
            method: 'POST',
            data: { path : path },
            dataType: 'text',
        }).
            done(function(res){
                $(".modal #file-path").text(path);
                $(".modal #code").text(res);
                editor.setValue(res);

        }).fail(function(err){
                console.log("In fail");
                console.log(err);
        });
    });

    /* =========================== For saving file ============================= */
    $(".save").click(function(){

        var post_data = {};
        post_data.proj_id = $("#project_id").text();
        post_data.path = $(".modal #file-path").text();
        post_data.code = editor.getValue();

        $.ajax({
            url : '/save',
            method: 'post',
            data: post_data,
            dataType: 'json',
        }).
            done(function(res){
                if(res.status)
                    editor.setValue($(".modal #code").text());

                alert(res.message);
        }).
            fail(function(err){
            console.log(err);
        })
    });

    /* =========================== For deleting file folder =================== */
    $(".delete-path").click(function(evt){
        evt.preventDefault();

        var target = $(this).parent().parent();
        var data = {};
        var flag = false;
        data.proj_id = $("#project_id").text();
        data.path = $(this).parent().find('p').text();

        if (data.path[-1] == '/')
            data.path = data.path.slice(0,-1);

        $.ajax({
            url: '/delete_path',
            method: 'POST',
            data: data,
            dataType: 'json'
        }).
            done(function(data){
                alert(data.message);

                if(!data.status)
                    target.remove();

        }).
            fail(function(err){
            console.log(err)
        });
    });

    /* =========================== For committing changes ====================== */
    $("form#commit-changes-form").submit(function(evt){

        evt.preventDefault();
        var post_data = { proj_id : $("#project_id").text() , message : $(evt.target).find("[name='commit-message']").val() };

        $.ajax({
            url: '/commit',
            method: 'post',
            data: post_data,
            dataType: 'json',
        }).
            done(function(res){
                alert(res.message);

                if(res.status != 1 && res.status != 3)
                    displayDirStructure(res.list_dir);

        }).
            fail(function(err){
                console.log(err);
        });

    });

    /* =========================== For merging changes to master ========================= */
    $("#merge").click(function(){
        var post_data = { proj_id : $("#project_id").text() , parent_branch : 'master' , child_branch: current_branch };

        $.ajax({
            url: '/merge',
            method: 'post',
            data: post_data,
            dataType: 'json',
        }).
            done(function(res){
                alert(res.message);
        }).
            fail(function(err){
                console.log(err);
        });
    });


    /* ========================= For adding new member to project ======================== */
    $("a#members-form-submit").click(function(evt){

        console.log('Test');
        evt.preventDefault();
        var userName = $("input#member-name").val();

        $.ajax({
            url: '/add_members',
            method: 'post',
            data : { member_name: userName , proj_id : $("#project_id").text()},
            dataType : 'json',
        }).
            done(function(res) {

            if(res.status === 0) {

                var member_panel = $(".member-panel:last-of-type");

                if(member_panel.length == 0) {
                    console.log("In if");
                    member_panel.after("<div class='member-panel' id=" + res.member.id + ">" + res.member.userName + "<i class='fa fa-close right'></i> </div>");
                }
                else {
                    console.log("In else");
                    $(".project-members input").before("<div class='member-panel' id=" + res.member.id + ">" + res.member.userName + "<i class='fa fa-close right'></i> </div>")
                }
                $("input#member-name").val("");
            }

            else if (res.status === 1 || res.status === 2)
                alert(res['message']);

        }).
            fail(function (err) {
                console.log(err);
        });

    });

    $(".remove").click(function(evt){
        evt.preventDefault();

        console.log($(this).parent().attr('id'));
        var post_data = { proj_id : $("#project_id").text() , member_id : $(this).parent().attr('id') };
        var target = $(this);

        $.ajax({
            url: '/remove_members',
            method: 'post',
            data: post_data,
            dataType: 'json',
        }).
            done(function(res) {
                if(res.status === 0)
                    target.parent().remove();
                alert(res.message);

        }).
            fail(function(err) {
                console.log(err);
        })
    });
});


/* =========================== Change the current directory ==================== */
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

       displayDirStructure(res);
       callback(res);
    }).

    fail(function(err) {
        console.log(err);
    });
}


// =========================== Display the directory structure fetched from server =================================
function displayDirStructure(res){
    var table = $("table.project-directory tbody");
    table.html("");

    for (d in res.directories){
        table.append('<tr class="folders"><td> <i class="fa fa-folder"></i> <p>' + res.directories[d] + '/</p> </td></tr>')
    }

    for (f in res.files){
        table.append('<tr class="files"><td> <i class="fa fa-file-code-o"></i> <p>' + res.files[f] + '</p> </td></tr>')
    }
}
