$(document).ready(function () {
    var $id;


    $(".save-btn").on("click", function () {
        event.preventDefault();
        $.ajax({
            method: "PUT",
            url: "/save/" + $(this).attr("data-id")
        }).then(function (response) {
            console.log(response);
            window.location = "/"
        });
    });


    $(".delete-btn").on("click", function () {
        event.preventDefault();
        $.ajax({
            method: "DELETE",
            url: "/delete/" + $(this).attr("data-id")
        }).then(function (response) {
            console.log(response);
            window.location = "/saved"
        });
    });


    $(".note-btn").on("click", function () {
        $("#note-modal").modal("show");
        $id = $(this).data("id");


        $("#display-notes").empty();
        $(".modal-title").text("");


        $.ajax({
            method: "GET",
            url: "/notes/" + $id
        }).then(function (response) {
            console.log(response);
            var $p = $("<p>");
            var $div = $("<div>");
            if (!response.notes.length) {
                $p.text("No notes!");
                $("#display-notes").append($p);
            } else {
                for (var i = 0; i < response.notes.length; i++) {
                    var $p = $("<p>");
                    var $btn = $("<button>");
                    $btn.text("X").addClass("note-delete-btn").attr("data-id", response.notes[i]._id);
                    $p.text(response.notes[i].note).addClass("note").append($btn);
                    $div.append($p);
                }
                $("#display-notes").append($div);
            }
            $(".modal-title").text(`Note for article ${response._id}`);
        });
    });


    $(".save-note-btn").on("click", function () {
        var $note = $(".modal textarea")
            .val()
            .trim();
        if (!$note) {
            alert("Please enter a note!");
        } else {
            $.ajax({
                method: "POST",
                url: "/savenote/" + $id,
                data: {
                    note: $note
                }
            }).then(function (response) {
                console.log(response);
                $(".modal textarea").val("");
                $id = null;
                $("#note-modal").modal("hide");
            });
        }
    });


    $(document).on("click", ".note-delete-btn", function () {
        var $id = $(this).data("id");
        $.ajax({
            method: "DELETE",
            url: "/deletenote/" + $id
        }).then(function (response) {
            console.log(response);
            $("#note-modal").modal("hide");
        });
    });
});