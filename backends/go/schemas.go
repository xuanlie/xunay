package main

import (
	"errors"
	"strings"
	"time"
)

type Todo struct {
	ID        int    `json:"id"`
	Title     string `json:"title"`
	Done      bool   `json:"done"`
	CreatedAt int64  `json:"created_at,omitempty"`
}

func (t *Todo) Validate() error {
	t.Title = strings.TrimSpace(t.Title)
	if t.Title == "" {
		return errors.New("title 不能为空")
	}
	if len(t.Title) > 200 {
		return errors.New("title 最多 200 字")
	}
	if t.CreatedAt == 0 {
		t.CreatedAt = time.Now().Unix()
	}
	return nil
}

type TodoIn struct {
	ID    int    `json:"id,omitempty"`
	Title string `json:"title,omitempty"`
}

func (t *TodoIn) ValidateID() error {
	if t.ID <= 0 {
		return errors.New("id 必填")
	}
	return nil
}

type TokenIn struct {
	Token string `json:"token"`
	IP    string `json:"ip,omitempty"`
}

func (t *TokenIn) Validate() error {
	if len(t.Token) != 32 {
		return errors.New("token 长度必须为 32")
	}
	return nil
}

type Response struct {
	OK    bool        `json:"ok"`
	Data  interface{} `json:"data"`
	Error *string     `json:"error"`
}

func ok(data interface{}) Response {
	return Response{OK: true, Data: data}
}

func fail(msg string) Response {
	return Response{OK: false, Data: nil, Error: &msg}
}
