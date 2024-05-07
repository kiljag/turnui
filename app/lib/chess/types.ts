
// client to ws server
export const TYPE_CREATE_ROOM = "create_room";
export const TYPE_JOIN_ROOM = "join_room";
export const TYPE_ADD_TO_ROOM = "add_to_room";
export const TYPE_MAKE_MOVE = "make_move";
export const TYPE_LEAVE_ROOM = "leave_room";
// export const TYPE_VIEW_ROOM = "view_room";

// ws server to client
export const TYPE_ROOM_INFO = "room_info";
export const TYPE_ROOM_READY = "room_ready";
export const TYPE_PLAYER_INFO = "player_info";
export const TYPE_START_GAME = "start_game";
export const TYPE_END_GAME = "end_game";
export const TYPE_CHESS_MOVE = "game_move";
export const TYPE_VIEWER_INFO = "viewer_info";

// server to client error messages
export const TYPE_ROOM_IS_FULL = "room_full";
export const TYPE_INVALID_MOVE = "invalid_move";
export const TYPE_OPPONENT_LEFT = "opponent_left";

//
export const TYPE_RTC_MESSAGE = "rtc_message";
export const TYPE_CHAT_MESSAGE = "chat_message";
