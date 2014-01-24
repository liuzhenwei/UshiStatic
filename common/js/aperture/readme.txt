假设上传的网站域名为http://abc.com

打开aperture.js，将第四行的代码修改为: var _root="http://abc.com/";

在所需嵌入的页面添加以下代码到</body>之前：

<script type="text/javascript" src="http://abc.com/aperture.js"></script>

