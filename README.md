# API document
- POST: /v1/files/upload?path=?&extract=?
- GET: /v1/files?path=?&strategy=?&chunkSize=?

- Đối với POST:
Nếu extract là true thì phải kiểm tra tất cả các file/folder cấp 1 xem đã tồn tại trước đó trong path hay chưa. Nếu đã tồn tại rồi thì trả về lỗi.
Nếu thỏa mãn thì tiếp tục kiểm tra mime type tất cả các file trong các cấp tiếp theo trong toàn cây thư mục để xem đúng định dạng ko.
- Đối với GET:
Chỉ có strategy là segmenting thì mới có chunkSize. Tất cả các strategy đều phải archive trước khi gửi đến client.
Các loại strategy:
- normal
- download
- segment
- attach


