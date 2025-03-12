// YES24 自动预订脚本样式

export const styles = {
  panel: `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #fff;
    border: 2px solid #ff6600;
    border-radius: 5px;
    padding: 15px;
    z-index: 9999;
    box-shadow: 0 0 10px rgba(0,0,0,0.2);
    width: 250px;
    font-family: Arial, sans-serif;
  `,
  
  heading: `
    margin-top: 0; 
    color: #ff6600; 
    text-align: center;
    font-size: 16px;
    font-weight: bold;
  `,
  
  formGroup: `
    margin-bottom: 10px;
  `,
  
  label: `
    display: block;
    margin-bottom: 5px;
    font-size: 14px;
  `,
  
  input: `
    width: 100%; 
    padding: 5px; 
    margin-top: 5px; 
    box-sizing: border-box;
    border: 1px solid #ccc;
    border-radius: 3px;
  `,
  
  buttonContainer: `
    display: flex; 
    justify-content: space-between; 
    margin-top: 10px;
  `,
  
  primaryButton: `
    background: #ff6600; 
    color: white; 
    border: none; 
    padding: 8px 15px; 
    cursor: pointer; 
    flex: 1; 
    margin-right: 5px;
    border-radius: 3px;
  `,
  
  secondaryButton: `
    background: #ccc; 
    border: none; 
    padding: 8px 15px; 
    cursor: pointer; 
    flex: 1; 
    margin-left: 5px;
    border-radius: 3px;
  `,
  
  statusMessage: `
    margin-top: 10px; 
    font-size: 12px; 
    color: #666; 
    text-align: center;
  `,
  
  countdown: `
    margin-top: 5px; 
    font-weight: bold; 
    text-align: center; 
    color: #ff6600;
  `,
  
  dateTimeContainer: `
    display: flex;
    flex-direction: column;
    gap: 5px;
  `,
  
  inputContainer: `
    margin-bottom: 8px;
    width: 100%;
  `
};
