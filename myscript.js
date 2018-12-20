$(document).ready(function () {
    InitBoard();
});

function InitBoard() {
    var light = 1;
    var colour;
    var rank;
    var file;

    for (i = 8; i >= 1; i--) {

        light ^= 1;
        rank = "rank" + i;
        for (j = 1; j <= 8; j++) {
            file = "file" + j;
            if (light == 0) {
                colour = "light";
            } else {
                colour = "dark";
            }
            light ^= 1;
            squareString = "<div class=\"square " + rank + " " + file + " " + colour + "\"/>";
            $("#board").append(squareString);

        }
    }
}