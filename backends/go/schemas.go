package main

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"time"
)

func nowMs() int64 { return time.Now().UnixMilli() }

func newUUID() string {
	b := make([]byte, 16)
	rand.Read(b)
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:])
}

type Todo struct {
	ID        string `json:"id"`
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
	if t.ID == "" {
		t.ID = newUUID()
	}
	if t.CreatedAt == 0 {
		t.CreatedAt = nowMs()
	}
	return nil
}

type TodoIn struct {
	ID string `json:"id,omitempty"`
}

func (t *TodoIn) ValidateID() error {
	if t.ID == "" {
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
	return Response{OK: true, Data: data, Error: nil}
}

func fail(msg string) Response {
	return Response{OK: false, Data: nil, Error: &msg}
}

// hex16 生成 16 字节的 hex 字符串（32 位），跟 Node/Python 的 randomBytes(16).toString('hex') 一致
func hex16() string {
	b := make([]byte, 16)
	rand.Read(b)
	return hex.EncodeToString(b)
}
