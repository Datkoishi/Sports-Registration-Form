document.addEventListener("DOMContentLoaded", () => {
    // Tạo các biểu tượng thể thao nổi
    const sportsIcons = document.getElementById("sportsIcons");
    const icons = [
      "fa-futbol", "fa-basketball-ball", "fa-volleyball-ball", 
      "fa-running", "fa-table-tennis", "fa-chess", 
      "fa-trophy", "fa-medal", "fa-stopwatch"
    ];
    
    for (let i = 0; i < 20; i++) {
      const icon = document.createElement("i");
      icon.className = `fas ${icons[Math.floor(Math.random() * icons.length)]} sports-icon`;
      icon.style.left = `${Math.random() * 100}%`;
      icon.style.animationDuration = `${15 + Math.random() * 10}s`;
      icon.style.animationDelay = `${Math.random() * 5}s`;
      sportsIcons.appendChild(icon);
    }
    
    // Đảm bảo thông báo thành công luôn ẩn khi trang tải
    const successMessage = document.getElementById("successMessage");
    successMessage.classList.add("hidden");
    
    // Elements
    const form = document.getElementById("registrationForm");
    const sportCheckboxes = document.querySelectorAll(".sport-checkbox");
    const selectedCountElement = document.getElementById("selectedCount");
    const submitBtn = document.getElementById("submitBtn");
    const resetBtn = document.getElementById("resetBtn");
    const closeSuccessBtn = document.getElementById("closeSuccessBtn");
    const progressBar = document.getElementById("progressBar");
    const progressPercent = document.getElementById("progressPercent");
  
    // Cập nhật progress bar
    function updateProgress() {
      const requiredFields = form.querySelectorAll("[required]");
      let filledCount = 0;
      
      requiredFields.forEach(field => {
        if (field.type === "checkbox" || field.type === "radio") {
          if (field.checked) filledCount++;
        } else if (field.value.trim() !== "") {
          filledCount++;
        }
      });
      
      // Kiểm tra xem đã chọn ít nhất một môn thi đấu chưa
      const selectedSports = document.querySelectorAll(".sport-checkbox:checked");
      if (selectedSports.length > 0) {
        filledCount++;
      }
      
      const percent = Math.min(Math.round((filledCount / (requiredFields.length + 1)) * 100), 100);
      progressBar.style.width = `${percent}%`;
      progressPercent.textContent = `${percent}%`;
    }
  
    // Cập nhật tên file khi chọn file
    window.updateFileName = (input, elementId) => {
      const fileNameElement = document.getElementById(elementId);
      if (input.files && input.files[0]) {
        fileNameElement.textContent = input.files[0].name;
      } else {
        fileNameElement.textContent = "";
      }
      updateProgress();
    }
  
    // Toggle previous experience details
    window.togglePreviousExperience = (show) => {
      const detailsSection = document.getElementById("previousExperienceDetails");
      if (show) {
        detailsSection.classList.remove("hidden");
        detailsSection.style.animation = "fadeIn 0.5s ease";
      } else {
        detailsSection.classList.add("hidden");
      }
      updateProgress();
    }
  
    // Handle sport selection and sub-options
    sportCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", function () {
        // Update selected count
        const selectedSports = document.querySelectorAll(".sport-checkbox:checked");
        selectedCountElement.textContent = selectedSports.length;
  
        // Limit to 2 selections
        if (selectedSports.length > 2) {
          this.checked = false;
          selectedCountElement.textContent = document.querySelectorAll(".sport-checkbox:checked").length;
          alert("Bạn chỉ được chọn tối đa 2 môn thi đấu!");
          return;
        }
  
        // Toggle sub-options
        const parentId = this.getAttribute("data-parent");
        if (parentId) {
          const subOptions = document.querySelector(`.sub-options[data-for="${parentId}"]`);
          if (subOptions) {
            if (this.checked) {
              subOptions.classList.remove("hidden");
              subOptions.style.animation = "fadeIn 0.5s ease";
            } else {
              subOptions.classList.add("hidden");
            }
          }
        }
        
        updateProgress();
      });
    });
  
    // Theo dõi sự thay đổi của tất cả các trường input để cập nhật progress bar
    const allInputs = form.querySelectorAll("input, select, textarea");
    allInputs.forEach(input => {
      input.addEventListener("change", updateProgress);
      input.addEventListener("input", updateProgress);
    });
  
    // Form submission
    form.addEventListener("submit", (e) => {
      e.preventDefault();
  
      // Basic validation
      if (!validateForm()) {
        return;
      }
  
      // Kiểm tra xem tất cả các trường bắt buộc đã được điền chưa
      if (!form.checkValidity()) {
        // Kích hoạt kiểm tra tính hợp lệ của trình duyệt
        form.reportValidity();
        return;
      }
  
      // Kiểm tra xem đã chọn ít nhất một môn thi đấu chưa
      const selectedSports = document.querySelectorAll(".sport-checkbox:checked");
      if (selectedSports.length === 0) {
        alert("Vui lòng chọn ít nhất một môn thi đấu!");
        return;
      }
  
      // Prepare form data for Google Forms
      const formData = new FormData(form);
  
      // Simulate form submission
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
  
      // Giả lập gửi dữ liệu đến Google Forms
      setTimeout(() => {
        try {
          // Giả lập thành công
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi đăng ký';
          
          // Chỉ hiển thị thông báo thành công khi đã gửi dữ liệu thành công
          successMessage.classList.remove("hidden");
        } catch (error) {
          // Xử lý lỗi nếu có
          alert("Có lỗi xảy ra khi gửi form. Vui lòng thử lại sau!");
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi đăng ký';
        }
      }, 1500);
    });
  
    // Close success message
    closeSuccessBtn.addEventListener("click", () => {
      successMessage.classList.add("hidden");
      form.reset();
      // Reset all sub-options
      document.querySelectorAll(".sub-options").forEach((el) => {
        el.classList.add("hidden");
      });
      // Reset selected count
      selectedCountElement.textContent = "0";
      // Reset previous experience details
      document.getElementById("previousExperienceDetails").classList.add("hidden");
      // Reset file names
      document.querySelectorAll(".file-name").forEach(el => {
        el.textContent = "";
      });
      // Reset progress bar
      progressBar.style.width = "0%";
      progressPercent.textContent = "0%";
    });
  
    // Reset button
    resetBtn.addEventListener("click", () => {
      // Reset all sub-options
      document.querySelectorAll(".sub-options").forEach((el) => {
        el.classList.add("hidden");
      });
      // Reset selected count
      selectedCountElement.textContent = "0";
      // Reset previous experience details
      document.getElementById("previousExperienceDetails").classList.add("hidden");
      // Reset file names
      document.querySelectorAll(".file-name").forEach(el => {
        el.textContent = "";
      });
      // Reset progress bar
      progressBar.style.width = "0%";
      progressPercent.textContent = "0%";
    });
  
    // Form validation
    function validateForm() {
      // Kiểm tra các trường bắt buộc
      const requiredFields = form.querySelectorAll("[required]");
      let isValid = true;
      
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          field.focus();
          isValid = false;
          return false;
        }
      });
      
      if (!isValid) {
        alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
        return false;
      }
  
      // Check if at least one sport is selected
      const selectedSports = document.querySelectorAll(".sport-checkbox:checked");
      if (selectedSports.length === 0) {
        alert("Vui lòng chọn ít nhất một môn thi đấu!");
        return false;
      }
  
      // Check agreements
      if (!document.getElementById("agreement1").checked || !document.getElementById("agreement2").checked) {
        alert("Vui lòng đồng ý với các điều khoản cam kết!");
        return false;
      }
  
      // Check if weight is provided for weight-based sports
      const weightBasedSports = ["tugofwar-male", "tugofwar-female", "armwrestling-male", "armwrestling-female"];
  
      for (const sportId of weightBasedSports) {
        const sportCheckbox = document.getElementById(sportId);
        if (sportCheckbox && sportCheckbox.checked) {
          const weightInput = document.getElementById(`${sportId}-weight`);
          if (weightInput && (!weightInput.value || isNaN(weightInput.value))) {
            alert("Vui lòng nhập cân nặng cho các môn yêu cầu thông tin này!");
            weightInput.focus();
            return false;
          }
        }
      }
  
      // Check if weight class is selected for arm wrestling
      if (document.getElementById("armwrestling-male") && document.getElementById("armwrestling-male").checked) {
        const weightClass = document.querySelector('input[name="armwrestling-male-weight-class"]:checked');
        if (!weightClass) {
          alert("Vui lòng chọn hạng cân cho môn Đẩy gậy nam!");
          return false;
        }
      }
  
      if (document.getElementById("armwrestling-female") && document.getElementById("armwrestling-female").checked) {
        const weightClass = document.querySelector('input[name="armwrestling-female-weight-class"]:checked');
        if (!weightClass) {
          alert("Vui lòng chọn hạng cân cho môn Đẩy gậy nữ!");
          return false;
        }
      }
  
      // Check if role is selected for team sports
      const teamSports = [
        "football-male",
        "football-female",
        "volleyball-male",
        "volleyball-female",
        "basketball-male",
        "basketball-female",
      ];
  
      for (const sportId of teamSports) {
        const sportCheckbox = document.getElementById(sportId);
        if (sportCheckbox && sportCheckbox.checked) {
          const roleSelected = document.querySelector(`input[name="${sportId}-role"]:checked`);
          if (!roleSelected) {
            alert(`Vui lòng chọn vai trò cho môn ${sportCheckbox.value}!`);
            return false;
          }
        }
      }
  
      // Check partner information for doubles sports
      const doublesSports = [
        "tabletennis-double",
        "badminton-double"
      ];
  
      for (const sportId of doublesSports) {
        const sportCheckbox = document.getElementById(sportId);
        if (sportCheckbox && sportCheckbox.checked) {
          const partnerId = sportId.split('-')[0];
          const partnerName = document.getElementById(`${partnerId}-partner`);
          const partnerStudentId = document.getElementById(`${partnerId}-partner-id`);
          
          if (!partnerName || !partnerName.value.trim()) {
            alert(`Vui lòng nhập tên đối tác cho môn ${sportCheckbox.value}!`);
            if (partnerName) partnerName.focus();
            return false;
          }
          
          if (!partnerStudentId || !partnerStudentId.value.trim()) {
            alert(`Vui lòng nhập MSSV đối tác cho môn ${sportCheckbox.value}!`);
            if (partnerStudentId) partnerStudentId.focus();
            return false;
          }
        }
      }
  
      return true;
    }
  
    // Khởi tạo progress bar
    updateProgress();
    
    // Thêm hiệu ứng scroll mượt khi click vào các section
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
          behavior: 'smooth'
        });
      });
    });
    
    // Thêm hiệu ứng hover 3D cho các phần tử
    const formSections = document.querySelectorAll('.form-section');
    formSections.forEach(section => {
      section.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const xPercent = x / rect.width - 0.5;
        const yPercent = y / rect.height - 0.5;
        
        const rotateX = yPercent * -3;
        const rotateY = xPercent * 3;
        
        this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
      });
      
      section.addEventListener('mouseleave', function() {
        this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
      });
    });
  });