var websocketGame = 
{
	//constants
	LINE_SEGMENT: 0,
	CHAT_MESSAGE: 1,
	GAME_LOGIC: 2,
	//constant for game logic state
	WAITING_TO_START: 0,
	GAME_START: 1,
	GAME_OVER: 2,
	GAME_RESTART: 3,

	isTurnToDraw: false,
	//indicates if you are drawing
	isDrawing: false,
	//the starting point if the next line drawing
	startX: 0,
	startY: 0,
}

//canvas context
var canvas = document.getElementById('drawing-pad');
var ctx = canvas.getContext('2d');


//init script when the DOM is ready
$(function()
{
	//check is existence of websocket in browser
	if(window["WebSocket"])
	{
		//create connection
		var HOST = location.origin.replace(/^http/, 'ws')
      	websocketGame.socket = new WebSocket(HOST);
		//on open event
		websocketGame.socket.onopen = function(e)
		{
			console.log('WebSocket connection established.');
		};
		//on close event
		websocketGame.socket.onclose = function(e)
		{
			console.log('WebSocket connection closed.');
		};
		//on message event
		websocketGame.socket.onmessage = function(e)
		{
			//check if the received data is chat or line segment
			console.log("onmessage event:", e.data);
			var data = JSON.parse(e.data);
			if(data.dataType === websocketGame.CHAT_MESSAGE)
			{
				$("#chat-history").append("<li>" + data.sender + ": " + data.message + "</li>");
			}
			else if(data.dataType === websocketGame.LINE_SEGMENT)
			{
				drawLine(ctx, data.startX, data.startY, data.endX, data.endY, 1);
			}
			else if(data.dataType === websocketGame.GAME_LOGIC)
			{
				if (data.gameState === websocketGame.GAME_OVER) 
				{
					websocketGame.isTurnToDraw = false;
					$("#chat-history").append("<li>" + data.winner + " wins! The answser is '" +data.answer+ "'.</li>");
					$("#restart").show();
				}
				if(data.gameState === websocketGame.GAME_START)
				{
					//CLEAR THE CANVAS
					canvas.width = canvas.width;
					//hide the restart btn
					$("#restart").hide();
					//clear the chat history
					$("#chat-history").html("");

					if(data.isPlayerTurn)
					{
						websocketGame.isTurnToDraw = true;
						$("#chat-history").append("<li>Your turn to draw. Please draw '" + data.answer + "'.</li>");
					}
					else
					{

						$("#chat-history").append("<li>Game Started. Get ready. You have one minute to guess.</li>");
					}
				}
			}
		};
	}

	//the logic drawing
	$("#drawing-pad").mousedown(function(e)
	{
		//get the mouse x and y relative to the canvas top-left point
		var mouseX = e.originalEvent.layerX || e.offsetX || 0;
		var mouseY = e.originalEvent.layerY || e.offsetY || 0;

		websocketGame.startX = mouseX;
		websocketGame.startY = mouseY;

		websocketGame.isDrawing = true;
	});

	$("#drawing-pad").mousemove(function(e)
	{
		//draw lines when move and if isdrawing:true
		if(websocketGame.isDrawing)
		{
			//get the mouse x and y
			//relative to the canvas top-left point.
			var mouseX = e.originalEvent.layerX || e.offsetX || 0;
			var mouseY = e.originalEvent.layerY || e.offsetY || 0;

			if(!(mouseX === websocketGame.startX && mouseY === websocketGame.startY))
			{
				drawLine(ctx, websocketGame.startX, websocketGame.startY, mouseX, mouseY, 1);

				//send the line segment to server
				var data = {};
				data.dataType = websocketGame.LINE_SEGMENT;
				data.startX = websocketGame.startX;
				data.startY = websocketGame.startY;
				data.endX = mouseX;
				data.endY = mouseY;
				websocketGame.socket.send(JSON.stringify(data));

				websocketGame.startX = mouseX;
				websocketGame.startY = mouseY;
			}
		}
	});

	$("#drawing-pad").mouseup(function(e)
	{
		websocketGame.isDrawing = false;
	});
});

$("#send").click(sendMessage);
$("#chat-input").keypress(function(e)
{
	if(e.keyCode === 13)
	{
		sendMessage();
	}
});

function sendMessage()
{
	var message = $("#chat-input").val();
	//pack the message into an object
	var data = {};
	data.dataType = websocketGame.CHAT_MESSAGE;
	data.message = message;

	websocketGame.socket.send(JSON.stringify(data));
	$("#chat-input").val("");
}

function drawLine(ctx, x1,y1,x2,y2,thickness)
{
	ctx.beginPath();
	ctx.moveTo(x1,y1);
	ctx.lineTo(x2,y2);
	ctx.lineWidth = thickness;
	ctx.strokeStyle = "#444";
	ctx.stroke();
}

//restart btn
$("#restart").hide();
$("#restart").click(function()
{
	canvas.width = canvas.width;
	$("#chat-history").html("");
	$("#chat-history").append("<li>Restarting game.</li>");
	//pack the restart message into an object.
	var data = {};
	data.dataType = websocketGame.GAME_LOGIC;
	data.gameState = websocketGame.GAME_RESTART;
	websocketGame.socket.send(JSON.stringify(data));

	$("#restart").hide();
});