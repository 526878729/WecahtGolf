/**
 * Created by 2nd on 16/1/10.
 */
$(function(){
  //侧边栏菜单
  $('.head_menu_btn').on('click',function(){
    if($('.head_menu1').is(':hidden')){
      $('.head_menu1').show(0).stop().animate({
        'left' : '0',
        'opacity' : '1'
      },500);
    }else{
      $('.head_menu1').stop().animate({
        'left' : '-100%',
        'opacity' : '0'
      },500,function(){
        $(this).hide(0);
      });
    }
  });

  $('.back-btn').click(function () {
    window.history.back();
  });


  //分享按键点击事件
  $('.btn_fenxiang').on('click',function(){
    $('.tg_fenxiang').show(0);
  });
  //取消分享
  $('.close_fenxiang').on('click',function(){
    $('.tg_fenxiang').hide(0);
  });
});