using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Themis.Core.Entities;
using Themis.Core.Interfaces;

namespace Themis.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DepartmentsController : ControllerBase
    {
        private readonly IRepository<Department> _departmentRepository;

        public DepartmentsController(IRepository<Department> departmentRepository)
        {
            _departmentRepository = departmentRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Department>>> GetDepartments()
        {
            var departments = await _departmentRepository.ListAllAsync();
            return Ok(departments);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Department>> GetDepartment(Guid id)
        {
            var department = await _departmentRepository.GetByIdAsync(id);

            if (department == null)
            {
                return NotFound();
            }

            return Ok(department);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Executive,MainPMO")]
        public async Task<ActionResult<Department>> CreateDepartment([FromBody] Department department)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var createdDepartment = await _departmentRepository.AddAsync(department);
            return CreatedAtAction(nameof(GetDepartment), new { id = createdDepartment.Id }, createdDepartment);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Executive,MainPMO")]
        public async Task<IActionResult> UpdateDepartment(Guid id, [FromBody] Department department)
        {
            if (id != department.Id)
            {
                return BadRequest();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingDepartment = await _departmentRepository.GetByIdAsync(id);
            if (existingDepartment == null)
            {
                return NotFound();
            }

            existingDepartment.Name = department.Name;
            await _departmentRepository.UpdateAsync(existingDepartment);

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Executive")]
        public async Task<IActionResult> DeleteDepartment(Guid id)
        {
            var department = await _departmentRepository.GetByIdAsync(id);
            if (department == null)
            {
                return NotFound();
            }

            await _departmentRepository.DeleteAsync(department);

            return NoContent();
        }
    }
} 