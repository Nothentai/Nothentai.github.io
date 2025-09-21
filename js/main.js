/**
 * 主题主JavaScript文件
 * 实现侧边栏控制、搜索功能、回到顶部等交互效果
 */

// DOM加载完成后执行
$(document).ready(function() {
  // 侧边栏控制
  initSidebar();
  
  // 搜索功能
  initSearch();
  
  // 回到顶部按钮
  initBackToTop();
  
  // 图片加载效果
  initImageLoading();
  
  // 平滑滚动
  initSmoothScroll();
  
  // 鼠标滚轮控制横向滚动
  $('.main-content').on('wheel', function(event) {
    // 只有在元素可以横向滚动时才阻止默认行为
    if (this.scrollWidth > this.clientWidth) {
      event.preventDefault();
      // 根据滚轮方向和速度控制横向滚动
      this.scrollLeft += event.originalEvent.deltaY * -0.5;
    }
  });
});

/**
 * 侧边栏控制函数
 */
function initSidebar() {
  const menuBtn = $('#menu-btn');
  const closeSidebarBtn = $('#close-sidebar');
  const sidebar = $('#sidebar');
  const overlay = $('#overlay');
  
  // 菜单按钮点击事件
  menuBtn.click(function() {
    sidebar.addClass('sidebar-open');
    overlay.fadeIn();
    // 禁止背景滚动
    $('body').css('overflow', 'hidden');
  });
  
  // 关闭按钮点击事件
  closeSidebarBtn.click(function() {
    sidebar.removeClass('sidebar-open');
    overlay.fadeOut();
    // 恢复背景滚动
    $('body').css('overflow', 'auto');
  });
  
  // 点击遮罩层关闭侧边栏
  overlay.click(function() {
    sidebar.removeClass('sidebar-open');
    overlay.fadeOut();
    // 恢复背景滚动
    $('body').css('overflow', 'auto');
  });
  
  // ESC键关闭侧边栏
  $(document).keydown(function(e) {
    if (e.key === 'Escape' && sidebar.hasClass('sidebar-open')) {
      sidebar.removeClass('sidebar-open');
      overlay.fadeOut();
      $('body').css('overflow', 'auto');
    }
  });
}

/**
 * 搜索功能初始化
 */
function initSearch() {
  const searchBtn = $('.search-btn');
  const searchInput = $('.search-input');
  
  // 搜索按钮点击事件
  searchBtn.click(function() {
    const keyword = searchInput.val().trim();
    if (keyword) {
      performSearch(keyword);
    }
  });
  
  // 回车键搜索
  searchInput.keypress(function(e) {
    if (e.which === 13) {
      const keyword = $(this).val().trim();
      if (keyword) {
        performSearch(keyword);
      }
    }
  });
}

/**
 * 执行搜索操作
 * @param {string} keyword - 搜索关键词
 */
function performSearch(keyword) {
  // 跳转到Bing搜索，在not-hentai.com网站内搜索指定关键词
  window.location.href = `https://cn.bing.com/search?q=site:not-hentai.com ${encodeURIComponent(keyword)}`;
  console.log('搜索关键词:', keyword);
  
  // 简单的搜索提示
  alert('搜索关键词: ' + keyword);
  
  // 可以跳转到搜索结果页面
  // window.location.href = '/search?keyword=' + encodeURIComponent(keyword);
}

/**
 * 回到顶部按钮初始化
 */
function initBackToTop() {
  // 创建回到顶部按钮
  const backToTopBtn = $('<div class="back-to-top" id="back-to-top">↑</div>');
  $('body').append(backToTopBtn);
  
  // 滚动事件监听
  $(window).scroll(function() {
    if ($(this).scrollTop() > 300) {
      backToTopBtn.addClass('show');
    } else {
      backToTopBtn.removeClass('show');
    }
  });
  
  // 点击回到顶部
  backToTopBtn.click(function() {
    $('html, body').animate({
      scrollTop: 0
    }, 300);
  });
}

/**
 * 图片加载效果
 */
function initImageLoading() {
  // 为所有图片添加加载动画
  $('img').each(function() {
    const img = $(this);
    // 检查图片是否已经加载完成
    if (img[0].complete) {
      // 图片已加载，添加完成样式
      img.addClass('fade-in');
    } else {
      // 图片未加载，添加加载占位符效果
      img.addClass('image-placeholder');
      // 监听加载完成事件
      img.on('load', function() {
        img.removeClass('image-placeholder');
        img.addClass('fade-in');
        // 图片加载完成后，检查并更新瀑布流布局
        updateMasonryLayout();
      });
      // 监听加载失败事件
      img.on('error', function() {
        // 可以设置一个默认图片
        // img.attr('src', '/images/default.png');
        img.removeClass('image-placeholder');
      });
    }
    
    // 增强懒加载效果
    if (img.attr('loading') === 'lazy') {
      // 添加IntersectionObserver来监控图片是否进入视口
      const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // 图片进入视口，触发加载
            const imgElem = entry.target;
            if (imgElem.getAttribute('data-src')) {
              imgElem.src = imgElem.getAttribute('data-src');
              imgElem.removeAttribute('data-src');
            }
            observer.unobserve(imgElem);
          }
        });
      }, { threshold: 0.1 });
      
      observer.observe(img[0]);
    }
  });
  
  // 初始化fancybox灯箱效果
  if (typeof Fancybox !== 'undefined') {
    // 为带有data-fancybox属性的图片初始化灯箱
    Fancybox.bind('[data-fancybox="gallery"]', {
      // 配置选项
      Thumbs: {
        autoStart: true,
        hideOnClose: true
      },
      caption: function(fancybox, carousel, slide) {
        // 使用图片的alt属性作为标题
        return slide.$thumb?.alt || '';
      },
      // 动画效果
      animationEffect: 'zoom',
      animationDuration: 300
    });
  }
  
  // 初始化瀑布流布局
  initMasonryLayout();
}

/**
 * 初始化瀑布流布局
 */
function initMasonryLayout() {
  // 为所有gallery-pro容器添加瀑布流样式
  $('.gallery-pro').each(function() {
    const gallery = $(this);
    // 设置更紧凑的布局样式
    gallery.css({
      'display': 'grid',
      'grid-template-columns': 'repeat(auto-fill, minmax(300px, 1fr))',
      'grid-gap': '8px',
      'justify-items': 'center',
      'align-items': 'start'
    });
    
    // 更新瀑布流布局
    updateMasonryLayout();
  });
  
  // 监听窗口大小变化，重新计算瀑布流布局
  $(window).on('resize', function() {
    updateMasonryLayout();
  });
}

/**
 * 更新瀑布流布局
 */
function updateMasonryLayout() {
  $('.gallery-pro').each(function() {
    const gallery = $(this);
    const imageContainers = gallery.find('div');
    
    if (imageContainers.length === 0) return;
    
    // 为包裹图片的div设置样式，确保与图片完全对齐
    imageContainers.each(function(index) {
      const container = $(this);
      const img = container.find('img');
      
      if (img.length) {
        // 设置容器样式，确保与图片完全对齐
        container.css({
          'display': 'block',
          'width': '100%',
          'height': 'auto',
          'margin': '0',
          'padding': '0'
        });
        
        // 设置图片样式，确保按原始比例缩放并保持紧凑
        img.css({
          'width': '100%',
          'height': 'auto',
          'object-fit': 'cover',
          'border-radius': '4px',
          'transition': 'transform 0.2s ease-in-out',
          'margin': '0'
        });
        
        // 添加悬停效果
        img.hover(function() {
          $(this).css('transform', 'scale(1.02)');
        }, function() {
          $(this).css('transform', 'scale(1)');
        });
      }
    });
  });
}

/**
 * 平滑滚动初始化
 */
function initSmoothScroll() {
  // 为所有内部链接添加平滑滚动效果
  $('a[href^="#"]').on('click', function(e) {
    e.preventDefault();
    
    const targetId = $(this).attr('href');
    if (targetId === '#') return;
    
    const targetElement = $(targetId);
    if (targetElement.length) {
      $('html, body').animate({
        scrollTop: targetElement.offset().top
      }, 500);
    }
  });
}

/**
 * 响应式调整
 */
function initResponsiveAdjustments() {
  // 监听窗口大小变化
  $(window).resize(function() {
    const windowWidth = $(window).width();
    const sidebar = $('#sidebar');
    const overlay = $('#overlay');
    
    // 在大屏幕上自动关闭侧边栏
    if (windowWidth > 768 && sidebar.hasClass('sidebar-open')) {
      sidebar.removeClass('sidebar-open');
      overlay.fadeOut();
      $('body').css('overflow', 'auto');
    }
    
    // 根据屏幕宽度调整文章网格布局
    adjustArticleGrid();
  });
}

/**
 * 根据屏幕宽度调整文章网格布局
 */
function adjustArticleGrid() {
  const articleGrid = $('.article-grid');
  const windowWidth = $(window).width();
  
  if (articleGrid.length) {
    if (windowWidth <= 768) {
      articleGrid.css('grid-template-columns', 'repeat(2, 1fr)');
    } else if (windowWidth <= 1200) {
      articleGrid.css('grid-template-columns', 'repeat(3, 1fr)');
    } else {
      articleGrid.css('grid-template-columns', 'repeat(4, 1fr)');
    }
  }
}

/**
 * 懒加载图片
 */
function initLazyLoading() {
  // 简单的图片懒加载实现
  const lazyLoadImages = function() {
    const images = $('img[data-src]');
    const windowHeight = $(window).height();
    const pageTop = $(window).scrollTop();
    
    images.each(function() {
      const img = $(this);
      const imgTop = img.offset().top;
      
      // 当图片进入视口时加载
      if (imgTop < pageTop + windowHeight + 500) {
        img.attr('src', img.attr('data-src'));
        img.removeAttr('data-src');
        
        // 添加加载动画
        img.one('load', function() {
          img.addClass('fade-in');
        });
      }
    });
  };
  
  // 初始加载和滚动时加载
  lazyLoadImages();
  $(window).scroll(lazyLoadImages);
}

/**
 * 代码高亮初始化
 */
function initHighlight() {
  // 如果页面有代码块，可以在这里初始化代码高亮
  // 例如使用 highlight.js、Prism 等库
}

/**
 * 统计页面访问量
 */
function trackPageView() {
  // 可以在这里添加页面访问统计代码
  // 例如 Google Analytics、百度统计等
  console.log('Page view tracked');
}